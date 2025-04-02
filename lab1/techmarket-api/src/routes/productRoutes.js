const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const {
  productValidationRules,
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


module.exports = router;
