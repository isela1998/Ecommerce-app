// Models
const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Category } = require('../models/category.model');
const { Cart } = require('../models/cart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

const validateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    attributes: { exclude: ['password'] },
    where: { id },
  });

  // If user doesn't exist, send error message
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // req.anyPropName = 'anyValue'
  req.user = user;
  next();
});

const validateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findOne({
    where: { id },
  });

  // If category doesn't exist, send error message
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  req.category = category;
  next();
});

const findProductInCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId } = req.body;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!cart) {
    return next(new AppError(`Sorry, we could not find an active cart`, 404));
  }

  // Verify if product exist in cart
  const prodInCart = await ProductInCart.findOne({
    where: { cartId: cart.id, productId },
  });

  if (!prodInCart) {
    return next(new AppError('Product not found in your cart', 404));
  }

  req.prodInCart = prodInCart;
  next();
});

// Verify if product is available
const validateProdInCart = catchAsync(async (req, res, next) => {
  const { productId, quantity, newQty } = req.body;
  const qty = quantity || newQty;

  const product = await Product.findOne({
    where: { id: productId, status: 'active' },
  });

  if (!product) {
    return next(new AppError('Sorry, product not found', 404));
  } else if (qty > product.quantity) {
    return next(
      new AppError(`Sorry, available only ${product.quantity} items`, 400)
    );
  }

  req.product = product;
  next();
});

module.exports = {
  validateUser,
  validateCategory,
  findProductInCart,
  validateProdInCart,
};
