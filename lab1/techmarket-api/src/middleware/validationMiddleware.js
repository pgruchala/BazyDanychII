const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const productValidationRules = {
  create: [
    body('name').notEmpty().trim().isLength({ min: 2, max: 255 })
      .withMessage('Name must be between 2 and 255 characters'),
    body('category').notEmpty().trim().isLength({ min: 2, max: 100 })
      .withMessage('Category must be between 2 and 100 characters'),
    body('description').optional().trim(),
    body('price').notEmpty().isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('brand').notEmpty().trim().isLength({ min: 2, max: 100 })
      .withMessage('Brand must be between 2 and 100 characters'),
    body('stockCount').optional().isInt({ min: 0 })
      .withMessage('Stock count must be a non-negative integer'),
    body('isAvailable').optional().isBoolean()
      .withMessage('isAvailable must be a boolean value'),
    validateRequest
  ],

  update: [
    param('id').isInt({ min: 1 })
      .withMessage('Invalid product ID'),
    body('name').optional().trim().isLength({ min: 2, max: 255 })
      .withMessage('Name must be between 2 and 255 characters'),
    body('category').optional().trim().isLength({ min: 2, max: 100 })
      .withMessage('Category must be between 2 and 100 characters'),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('brand').optional().trim().isLength({ min: 2, max: 100 })
      .withMessage('Brand must be between 2 and 100 characters'),
    body('stockCount').optional().isInt({ min: 0 })
      .withMessage('Stock count must be a non-negative integer'),
    body('isAvailable').optional().isBoolean()
      .withMessage('isAvailable must be a boolean value'),
    validateRequest
  ],

  getById: [
    param('id').isInt({ min: 1 })
      .withMessage('Invalid product ID'),
    validateRequest
  ],

  delete: [
    param('id').isInt({ min: 1 })
      .withMessage('Invalid product ID'),
    validateRequest
  ],

  getAll: [
    query('available').optional().isBoolean()
      .withMessage('available parameter must be a boolean'),
    query('sort').optional().isIn(['asc', 'desc'])
      .withMessage('sort must be either "asc" or "desc"'),
    validateRequest
  ]
};

module.exports = productValidationRules;