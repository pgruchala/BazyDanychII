const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const {
  categoryValidationRules,
} = require("../middleware/validationMiddleware");

router.get("/", categoryController.getAllCategories);
router.get(
  "/:name",
  categoryValidationRules.getByName,
  categoryController.getCategoryByName
);
router.post(
  "/",
  categoryValidationRules.create,
  categoryController.createCategory
);
router.patch(
  "/:id",
  categoryValidationRules.update,
  categoryController.updateCategory
);
router.delete(
  "/:id",
  categoryValidationRules.delete,
  categoryController.removeCategory
);

module.exports = router;
