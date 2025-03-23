const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const reviewController = require("../controllers/reviewController");
const {
  productValidationRules,
  reviewValidationRules,
} = require("../middleware/validationMiddleware");

router
  .route("/")
  .get(productValidationRules.getAll, productController.getAllProducts)
  .post(productValidationRules.create, productController.createProduct);

router
  .route("/:id")
  .get(productValidationRules.getById, productController.getProductById)
  .patch(productValidationRules.update, productController.updateProduct)
  .delete(productValidationRules.delete, productController.deleteProduct);

router
  .route("/:productId/reviews")
  .get(
    reviewValidationRules.getByProductId,
    reviewController.getReviewsByProductId
  )
  .post(reviewValidationRules.create, reviewController.createReview);

router
  .route("/:productId/reviews/:reviewId")
  .patch(reviewValidationRules.update, reviewController.updateReview)
  .delete(reviewValidationRules.delete, reviewController.removeReview);

module.exports = router;
