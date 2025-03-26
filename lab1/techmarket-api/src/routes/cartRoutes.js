const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { cartValidationRules } = require("../middleware/validationMiddleware");

router.post("/:userId", cartValidationRules.addToCart, cartController.addToCart);
router.get("/:userId", cartValidationRules.getCart, cartController.getCart);
router.patch(
  "/:cartItemId",
  cartValidationRules.updateCartItem,
  cartController.updateCartItem
);
router.delete(
  "/:cartItemId",
  cartValidationRules.removeFromCart,
  cartController.removeFromCart
);

module.exports = router