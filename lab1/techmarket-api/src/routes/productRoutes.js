const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const reviewController = require("../controllers/reviewController");
const productValidationRules = require("../middleware/validationMiddleware");

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
  .get(reviewController.getReviewsByProductId)
  .post(reviewController.createReview)

router
  .route("/:productId/reviews/:reviewId")
  .patch(reviewController.updateReview)
  .delete(reviewController.removeReview)

module.exports = router;
