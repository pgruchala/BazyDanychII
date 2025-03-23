const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { userValidationRules } = require("../middleware/validationMiddleware");

router.get("/", userController.getAllUsers);
router.get(
  "/:username",
  userValidationRules.getByUsername,
  userController.getUserByUsername
);
router.post("/", userValidationRules.create, userController.createUser);
router.patch("/:id", userValidationRules.update, userController.updateUser);
router.delete("/:id", userValidationRules.delete, userController.removeUser);

module.exports = router;
