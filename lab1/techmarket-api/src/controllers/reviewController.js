const prisma = require("../utils/prisma");

const getReviewsByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(productId),
      },
    });
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Produkt o nazwie ${productName} nie został znaleziony`,
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { userId, rating, comment } = req.body;
    if (!productId || !userId || !rating) {
      return res.status(400).json({
        status: "error",
        message: "ID produktu, ID użytkownika oraz ocena są wymagane",
      });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        status: "error",
        message: "Ocena musi być liczbą od 1 do 5",
      });
    }
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Produkt o ID ${productId} nie został znaleziony`,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `Użytkownik o ID ${userId} nie został znaleziony`,
      });
    }
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: parseInt(productId),
        userId: parseInt(userId),
      },
    });

    if (existingReview) {
      return res.status(400).json({
        status: "error",
        message: "Już dodałeś recenzję do tego produktu",
      });
    }

    const newReview = await prisma.review.create({
      data: {
        productId: parseInt(productId),
        userId: parseInt(userId),
        rating: ratingNum,
        comment: comment || "",
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      status: "success",
      message: "Recenzja została dodana pomyślnie",
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const reviewid = parseInt(reviewId);
    const productid = parseInt(productId);
    const { rating, comment } = req.body;

    if (isNaN(reviewid)) {
      return res.status(400).json({
        status: "error",
        message: "ID recenzji musi być liczbą",
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewid },
    });

    if (!existingReview) {
      return res.status(404).json({
        status: "error",
        message: `Recenzja o ID ${reviewid} nie została znaleziona`,
      });
    }
    let ratingNum;
    if (rating !== undefined) {
      ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          status: "error",
          message: "Ocena musi być liczbą od 1 do 5",
        });
      }
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewid },
      data: {
        rating: rating !== undefined ? ratingNum : undefined,
        comment: comment !== undefined ? comment : undefined,
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Recenzja została pomyślnie zaktualizowana",
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

const removeReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const reviewid = parseInt(reviewId);
    const productid = parseInt(productId);

    if (isNaN(reviewid)) {
      return res.status(400).json({
        status: "error",
        message: "ID recenzji musi być liczbą",
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewid },
    });

    if (!existingReview) {
      return res.status(404).json({
        status: "error",
        message: `Recenzja o ID ${reviewid} nie istnieje`,
      });
    }

    await prisma.review.delete({
      where: { id: reviewid },
    });

    res.status(200).json({
      status: "success",
      message: `Recenzja o ID ${reviewid} została pomyślnie usunięta`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewsByProductId,
  createReview,
  updateReview,
  removeReview,
};
