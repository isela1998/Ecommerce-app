// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { saveProductImages } = require('../utils/firebase.util');

// Create new product validating user in session
const createProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, categoryId, quantity } = req.body;
  const { sessionUser } = req;

  const newProduct = await Product.create({
    userId: sessionUser.id,
    title,
    description,
    categoryId,
    price,
    quantity,
  });

  await saveProductImages(req.files, newProduct.id);

  return res.status(201).json({
    status: 'success',
    data: { newProduct },
  });
});

// Get all products active
const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({ where: { status: 'active' } });

  return res.status(200).json({
    status: 'success',
    data: { products },
  });
});

// Get active product info by id
const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ where: { id, status: 'active' } });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: { product },
  });
});

// Update product info
const updateProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, quantity } = req.body;
  const { product } = req;

  await product.update({ title, description, price, quantity });

  return res.status(200).json({
    status: 'success',
    data: { product },
  });
});

// Delete soft for active product
const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  // Soft delete
  await product.update({ status: 'deleted' });
  return res.status(204).json({ status: 'success' });
});

// Get all active categories
const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({ where: { status: 'active' } });

  return res.status(200).json({
    status: 'success',
    data: { categories },
  });
});

// Register new product category
const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({ name });

  return res.status(201).json({
    status: 'success',
    data: { newCategory },
  });
});

// Update category info
const updateCategory = catchAsync(async (req, res, next) => {
  const { category } = req;
  const { name } = req.body;

  await category.update({ name });

  return res.status(200).json({
    status: 'success',
    data: { category },
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
};
