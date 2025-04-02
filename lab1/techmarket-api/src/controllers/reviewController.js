const { ObjectId } = require("mongodb");
const prisma = require("../utils/prisma");
const { getDb } = require("../../mongo");

//const db = getDb()
// const reviews = db.collection("reviews")

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

const reviewExist = async (reviewId) => {
  try {
    const id = new ObjectId(reviewId);
    const db = getDb();
    const review = await db.collection("reviews").findOne({ _id: id });
    return review ? true : false;
  } catch (error) {
    return false;
  }
};
//Tworzenie recenzji
const writeReview = (req, res, next) => {
  const {
    productId,
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
  try {
  } catch (error) {
    next(error);
  }
};

//Aktualizacja recenzji

const updateReview = (req, res, next) => {};

//usuwanie recenzji
const deleteReview = (req, res, next) => {};

//pobieranie recenzji z paginacją i sortowaniem

const getReviews = (req, res, next) => {};
//dodawanie reakcji
const upvote = (req, res, next) => {};

module.exports = {
  writeReview,
  updateReview,
  deleteReview,
  getReviews,
  upvote,
};
