// Models
const { Product } = require('../models/product.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Order } = require('../models/order.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

// Get cart user active and status products
const getActiveCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
    include: {
      model: ProductInCart,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  });

  if (!cart) {
    return next(new AppError(`Sorry, we could not find an active cart`, 404));
  }

  return res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

// Add product in active cart or create new cart
const addProductToCart = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const { sessionUser, product } = req;

  const cartActive = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!cartActive) {
    const newCart = await Cart.create({ userId: sessionUser.id });
    await ProductInCart.create({
      cartId: newCart.id,
      productId: product.id,
      quantity,
    });
  } else {
    const productExist = await ProductInCart.findOne({
      where: { productId: product.id, cartId: cartActive.id },
    });

    if (!productExist) {
      await ProductInCart.create({
        cartId: cartActive.id,
        productId: product.id,
        quantity,
      });
    } else if (productExist.status === 'active') {
      return next(new AppError('Product already exists', 400));
    } else if (productExist.status === 'removed') {
      await productExist.update({ quantity, status: 'active' });
    }
  }

  return res.status(201).json({
    status: 'success',
  });
});

// Update product quantity in active cart
const updateCart = catchAsync(async (req, res, next) => {
  const { newQty } = req.body;
  const { prodInCart } = req;

  if (newQty == 0) {
    await prodInCart.update({ quantity: 0, status: 'removed' });
  } else if (prodInCart.status == 'removed') {
    await prodInCart.update({ quantity: newQty, status: 'active' });
  } else {
    await prodInCart.update({ quantity: newQty });
  }

  return res.status(200).json({
    status: 'success',
  });
});

// Delete soft to product in cart
const deleteProdInCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!cart) {
    return next(new AppError(`Sorry, we could not find an active cart`, 404));
  }

  const prodInCart = await ProductInCart.findOne({
    where: { cartId: cart.id, productId },
  });

  if (!prodInCart) {
    return next(new AppError('Product not found in your cart', 404));
  } else {
    await prodInCart.update({ quantity: 0, status: 'removed' });
  }

  return res.status(200).json({
    status: 'success',
  });
});

// Generate the purchase cart and new order
const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: { model: ProductInCart },
  });

  if (!cart) {
    return next(new AppError('We do not have an active cart', 404));
  }

  let total = 0;
  const itemsPromises = cart.productInCarts.map(async (item) => {
    if (item.status == 'active') {
      const product = await Product.findOne({ where: { id: item.productId } });
      const newQty = product.quantity - item.quantity;

      const subtotal = item.quantity * product.price;
      total += subtotal;

      await product.update({ quantity: newQty });
      await item.update({ status: 'purchase' });
    } else {
      item.destroy();
    }
  });

  await Promise.all(itemsPromises);
  await cart.update({ status: 'purchased' });

  const newOrder = await Order.create({
    cartId: cart.id,
    userId: sessionUser.id,
    totalPrice: total,
  });

  res.status(201).json({
    status: 'success',
    data: { newOrder },
  });
});

module.exports = {
  addProductToCart,
  updateCart,
  deleteProdInCart,
  purchaseCart,
  getActiveCart,
};
