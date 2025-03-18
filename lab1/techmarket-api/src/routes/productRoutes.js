const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const productValidationRules = require("../middleware/validationMiddleware");

router.get("/", productValidationRules.getAll, productController.getAllProducts);
router.get("/:id", productValidationRules.getById, productController.getProductById);
router.post("/", productValidationRules.create, productController.createProduct);
router.patch("/:id", productValidationRules.update, productController.updateProduct);
router.delete("/:id", productValidationRules.delete, productController.deleteProduct);

module.exports = router;
