const { body, param, query } = require("express-validator");
const { validationResult } = require("express-validator");
const { user } = require("../utils/prisma");
const {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
} = require("../controllers/cartController");
const { reviewSchema } = require("../../mongo/productSchema");


const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const productValidationRules = {
  create: [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Name must be between 2 and 255 characters"),
    body("category")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Category must be between 2 and 100 characters"),
    body("description").optional().trim(),
    body("price")
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("brand")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Brand must be between 2 and 100 characters"),
    body("stockCount")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock count must be a non-negative integer"),
    body("isAvailable")
      .optional()
      .isBoolean()
      .withMessage("isAvailable must be a boolean value"),
    validateRequest,
  ],

  update: [
    param("id").isInt({ min: 1 }).withMessage("Invalid product ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Name must be between 2 and 255 characters"),
    body("category")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Category must be between 2 and 100 characters"),
    body("description").optional().trim(),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("brand")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Brand must be between 2 and 100 characters"),
    body("stockCount")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock count must be a non-negative integer"),
    body("isAvailable")
      .optional()
      .isBoolean()
      .withMessage("isAvailable must be a boolean value"),
    validateRequest,
  ],

  getById: [
    param("id").isInt({ min: 1 }).withMessage("Invalid product ID"),
    validateRequest,
  ],

  delete: [
    param("id").isInt({ min: 1 }).withMessage("Invalid product ID"),
    validateRequest,
  ],

  getAll: [
    query("available")
      .optional()
      .isBoolean()
      .withMessage("available parameter must be a boolean"),
    query("sort")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage('sort must be either "asc" or "desc"'),
    validateRequest,
  ],
};

const categoryValidationRules = {
  create: [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Category name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    validateRequest,
  ],
  update: [
    param("id").isInt({ min: 1 }).withMessage("Invalid category ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Category name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    validateRequest,
  ],
  getByName: [
    //getAll nie potrzebuje walidacji
    param("name")
      .notEmpty()
      .trim()
      .withMessage("Category name cannot be empty"),
    validateRequest,
  ],
  delete: [
    param("id").isInt({ min: 1 }).withMessage("Invalid category id"),
    validateRequest,
  ],
};


const userValidationRules = {
  create: [
    body("username")
      .notEmpty()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters"),
    body("email")
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email address is required"),
    body("password")
      .notEmpty()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name cannot exceed 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name cannot exceed 50 characters"),
    validateRequest,
  ],
  update: [
    param("id").isInt({ min: 1 }).withMessage("Invalid user ID"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email address is required"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("firstName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("First name cannot exceed 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Last name cannot exceed 50 characters"),
    validateRequest,
  ],
  delete: [
    param("id").isInt({ min: 1 }).withMessage("Invalid user ID"),
    validateRequest,
  ],
  getByUsername: [
    param("username").notEmpty().trim().withMessage("Username cannot be empty"),
    validateRequest,
  ],
};

const cartValidationRules = {
  addToCart: [
    param("userId")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive number"),
    body("productId")
      .isInt({ min: 1 })
      .withMessage("Product ID must be a positive number"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    validateRequest,
  ],
  updateCartItem: [
    param("cartItemId")
      .isInt({ min: 1 })
      .withMessage("Cart Item ID must be a positive number"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    validateRequest,
  ],
  removeFromCart: [
    param("cartItemId")
      .isInt({ min: 1 })
      .withMessage("Cart Item ID must be a positive number"),
    validateRequest,
  ],
  getCart: [
    param("userId")
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive number"),
    validateRequest,
  ],
};
const  validateMongoRequest = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
}


module.exports = {
  productValidationRules,
  categoryValidationRules,
  userValidationRules,
  cartValidationRules,
  validateMongoRequest
};
