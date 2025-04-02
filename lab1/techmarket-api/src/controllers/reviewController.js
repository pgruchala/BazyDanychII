const { ObjectId } = require("mongodb");
const prisma = require("../utils/prisma");
const { getDb } = require("../../mongo");

const productExist = async (productId) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });
    return product ? true : false;
  } catch (error) {
    return false;
  }
};
const userExist = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    return user ? true : false;
  } catch (error) {
    return false;
  }
};

const updateProductRatingStats = async (productId) => {
  try {
    const db = getDb();
    const reviews = await db
      .collection("reviews")
      .find({ productId })
      .toArray();
    if (reviews.length === 0) {
      await db.collection("productRatingStats").updateOne(
        { productId },
        {
          $set: {
            productId,
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating] =
        (ratingDistribution[review.rating] || 0) + 1;
    });

    await db.collection("productRatingStats").updateOne(
      { productId },
      {
        $set: {
          productId,
          averageRating,
          totalReviews: reviews.length,
          ratingDistribution,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error updating product rating stats:", error);
  }
};

const getProductRatingStats = async (productId) => {
  try {
    const db = getDb();
    let stats = await db
      .collection("productRatingStats")
      .findOne({ productId });
    if (!stats) {
      await updateProductRatingStats(productId);
      stats = await db.collection("productRatingStats").findOne({ productId });
    }

    return (
      stats || {
        productId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      }
    );
  } catch (error) {
    console.error("Error getting product rating stats:", error);
    return null;
  }
};
//Tworzenie recenzji
const writeReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const {
      userId,
      rating,
      title,
      content,
      pros,
      cons,
      verifiedPurchase,
      helpfulCount,
      createdAt,
      updatedAt,
    } = req.body;
    const isProductValid = await productExist(productId);
    const isUserValid = await userExist(userId);
    if (!isProductValid) {
      return res.status(404).json({
        status: "error",
        message: `Produkt o ID ${productId} nie został znaleziony`,
      });
    }

    if (!isUserValid) {
      return res.status(404).json({
        status: "error",
        message: `Użytkownik o ID ${userId} nie został znaleziony`,
      });
    }

    const db = getDb();

    const existingReview = await db.collection("reviews").findOne({
      $and: [{ productId: parseInt(productId) }, { userId: parseInt(userId) }],
    });
    if (existingReview) {
      return res.status(404).json({
        status: "error",
        message: "Użytkownik już dodał recenzję do tego produktu",
      });
    }
    const newReview = {
      productId: parseInt(productId),
      userId: parseInt(userId),
      rating,
      title,
      content,
      pros: pros || [],
      cons: cons || [],
      verifiedPurchase: verifiedPurchase || false,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("reviews").insertOne(newReview);
    await updateProductRatingStats(parseInt(productId));
    res.status(201).json({
      status: "success",
      message: "Recenzja została dodana",
      data: { _id: result.insertedId, ...newReview },
    });
  } catch (error) {
    next(error);
  }
};

//Aktualizacja recenzji

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, content, pros, cons } = req.body;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: `Recenzja o id ${id} nie została znaleziona`,
      });
    }
    const reviewId = new ObjectId(id);
    const db = getDb();

    const updatedFields = {
      updatedAt: new Date(),
    };

    if (rating !== undefined) updatedFields.rating = rating;
    if (title !== undefined) updatedFields.title = title;
    if (content !== undefined) updatedFields.content = content;
    if (pros !== undefined) updatedFields.pros = pros;
    if (cons !== undefined) updatedFields.cons = cons;

    const result = await db
      .collection("reviews")
      .findOneAndUpdate(
        { _id: reviewId },
        { $set: updatedFields },
        { returnDocument: "after" }
      );
    if (!result) {
      return res.status(404).json({
        status: "error",
        message: `Recenzja o ID ${id} nie została znaleziona`,
      });
    }
    await updateProductRatingStats(result.productId);
    res.status(200).json({
      status: "success",
      message: "Recenzja została zaktualizowana pomyślnie",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//usuwanie recenzji
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Niepoprawe id recenzji",
      });
    }
    const reviewId = new ObjectId(id);
    const db = getDb();
    const review = await db.collection("reviews").findOne({ _id: reviewId });

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Nie znaleziono recenzji o podanym id",
      });
    }
    const result = await db.collection("reviews").deleteOne({ _id: reviewId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Nie znaleziono recenzji o podanym id",
      });
    }
    await updateProductRatingStats(review.productId);
    res.status(200).json({
      status: "success",
      message: `Recenzja o ID ${id} została pomyślnie usunięta`,
    });
  } catch (error) {
    next(error);
  }
};

//pobieranie recenzji z paginacją i sortowaniem

const getReviews = async (req, res, next) => {
  try {
    const {
      productId,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      minRating,
      maxRating,
      verifiedOnly,
      query,
    } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "id produktu jest wymagane",
      });
    }

    const isValid = await productExist(productId);
    if (!isValid) {
      return res.status(400).json({
        status: "error",
        message: "Produkt o podanym id nie został odnaleziony",
      });
    }

    const db = getDb();
    const filter = { productId: parseInt(productId) };

    if (query) {
      await db.collection("reviews").createIndex({
        title: "text",
        content: "text",
        pros: "text",
        cons: "text",
      });
      filter.$text = { $search: query };
    }

    if (minRating !== undefined) {
      filter.rating = { $gte: parseInt(minRating) };
    }

    if (maxRating !== undefined) {
      if (filter.rating) {
        filter.rating.$lte = parseInt(maxRating);
      } else {
        filter.rating = { $lte: parseInt(maxRating) };
      }
    }
    if (verifiedOnly === "true") {
      filter.verifiedPurchase = true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    const reviews = await db
      .collection("reviews")
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit)
      .toArray();
    const totalReviews = await db.collection("reviews").countDocuments(filter);
    const ratingStats = await getProductRatingStats(parseInt(productId));
    res.status(200).json({
      status: "success",
      count: reviews.length,
      total: totalReviews,
      page: parsedPage,
      pages: Math.ceil(totalReviews / parsedLimit),
      data: reviews,
      ratingStats,
    });
  } catch (error) {
    next(error);
  }
};
//dodawanie reakcji
const upvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Nieprawidłowy format ID recenzji",
      });
    }

    const reviewId = new ObjectId(id);
    const db = getDb();

    const result = await db.collection("reviews").findOneAndUpdate(
      { _id: reviewId },
      { $inc: { helpfulCount: 1 } },
      { returnDocument: "after" } //zwraca nowy dokumernt z zupdateowanymi reakcjami na niego pzdr
    );
    if (!result) {
      return res.status(404).json({
        status: "error",
        message: `Recenzja o ID ${id} nie została znaleziona`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Głos został pomyślnie dodany",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  writeReview,
  updateReview,
  deleteReview,
  getReviews,
  upvote,
  getProductRatingStats,
};
