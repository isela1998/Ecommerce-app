const { body, validationResult } = require('express-validator');

// Utils
const { AppError } = require('../utils/appError.util');

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // [{ ..., msg }] -> [msg, msg, ...] -> 'msg. msg. msg. msg'
    const errorMessages = errors.array().map((err) => err.msg);

    const message = errorMessages.join('. ');

    return next(new AppError(message, 400));
  }

  next();
};

const signupValidators = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .notEmpty()
    .withMessage('Username cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Username must be at least 8 characters'),
  body('email').isEmail().withMessage('Must provide a valid email'),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  checkValidations,
];

const updateUserValidators = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .notEmpty()
    .withMessage('Username cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Username must be at least 8 characters'),
  body('email').isEmail().withMessage('Must provide a valid email'),
  checkValidations,
];

const newProductValidators = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('quantity').isInt().withMessage('Must provide a valid quantity'),
  body('price').isDecimal().withMessage('Must provide a valid price'),
  body('categoryId').isInt().withMessage('Must provide a valid category id'),
  checkValidations,
];

const updateProductValidators = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('price').isDecimal().withMessage('Must provide a valid price'),
  body('quantity').isInt().withMessage('Must provide a valid quantity'),
  checkValidations,
];

const categoryValidators = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name cannot be empty'),
  checkValidations,
];

const addProdInCartValidators = [
  body('productId')
    .isInt()
    .withMessage('Must be provide a valid product id')
    .notEmpty()
    .withMessage('Product id cannot be empty'),
  body('quantity')
    .isInt()
    .withMessage('Must be provide a valid quantity')
    .notEmpty()
    .withMessage('Quantity id cannot be empty'),
  checkValidations,
];

const updateCartValidators = [
  body('productId')
    .isInt()
    .withMessage('Must be provide a valid product id')
    .notEmpty()
    .withMessage('Product id cannot be empty'),
  body('newQty')
    .isInt()
    .withMessage('Must be provide a valid quantity')
    .notEmpty()
    .withMessage('Quantity id cannot be empty'),
  checkValidations,
];

module.exports = {
  signupValidators,
  updateUserValidators,
  newProductValidators,
  updateProductValidators,
  categoryValidators,
  addProdInCartValidators,
  updateCartValidators,
};
