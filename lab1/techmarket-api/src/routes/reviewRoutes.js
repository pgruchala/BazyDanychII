const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { validateMongoRequest } = require("../middleware/validationMiddleware");
const { reviewSchema } = require("../../mongo/productSchema");

router.post(
  "/:productId",
  validateMongoRequest(reviewSchema, "body"),
  reviewController.writeReview
);

router.get("/", reviewController.getReviews);

router.patch("/:id", reviewController.updateReview);

router.delete("/:id", reviewController.deleteReview);
router.post("/:id/upvote", reviewController.upvote);

module.exports = router;
