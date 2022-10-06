const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

dotenv.config({ path: './config.env' });

// Create new account
const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Encrypt password
  const salt = await bcrypt.genSalt(12);
  const hashedPass = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPass,
  });

  // Remove password from response
  newUser.password = undefined;

  // Get success response
  return res.status(201).json({
    status: 'success',
    data: { newUser },
  });
});

// Sign up with email and password
const login = catchAsync(async (req, res, next) => {
  // Get email and password from req.body
  const { email, password } = req.body;

  // Validate if the user exist with given email
  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  // Compare passwords (entered password vs db password)
  // If user doesn't exists or passwords doesn't match, send error
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Wrong credentials', 400));
  }

  // Remove password from response
  user.password = undefined;

  // Generate JWT (payload, secretOrPrivateKey, options)
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });

  res.status(200).json({
    status: 'success',
    data: { user, token },
  });
});

// Get all active products user
const getAllProductsUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  // Filtering by user id
  const products = await Product.findAll({
    where: { userId: sessionUser.id },
  });

  return res.status(200).json({
    status: 'success',
    data: { products },
  });
});

// Get all user orders
const getAllOrdersUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  // Filtering by user id
  const orders = await Order.findAll({
    where: { userId: sessionUser.id },
    attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
    include: {
      model: Cart,
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      include: {
        model: ProductInCart,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      },
    },
  });

  return res.status(200).json({
    status: 'sucess',
    data: { orders },
  });
});

// Get user order by id
const getOrderUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  // Filtering by user id
  const order = await Order.findOne({
    where: { id, userId: sessionUser.id },
    attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
    include: {
      model: Cart,
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      include: {
        model: ProductInCart,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      },
    },
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: { order },
  });
});

// Update account info
const updateUser = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;
  const { user } = req;

  await user.update({ username, email });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Delete soft for active user
const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'deleted' });

  res.status(204).json({ status: 'success' });
});

module.exports = {
  signup,
  login,
  getAllProductsUser,
  updateUser,
  deleteUser,
  getAllOrdersUser,
  getOrderUser,
};
