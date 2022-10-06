const express = require('express');

// Utils
const { upload } = require('../utils/multer.util');

// Controllers
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
} = require('../controllers/products.controller');

// Middlewares
const { validateCategory } = require('../middlewares/find.middlewares');

const {
  protectSession,
  protectProduct,
} = require('../middlewares/auth.middlewares');

const {
  newProductValidators,
  updateProductValidators,
  categoryValidators,
} = require('../middlewares/validators.middlewares');

const productsRouter = express.Router();

productsRouter.get('/', getAllProducts);

productsRouter.get('/categories', getAllCategories);

productsRouter.get('/:id', getProductById);

// Protecting below endpoints
productsRouter.use(protectSession);

productsRouter.post(
  '/',
  upload.array('productImgs', 5),
  newProductValidators,
  createProduct
);

productsRouter.patch(
  '/:id',
  protectProduct,
  updateProductValidators,
  updateProduct
);

productsRouter.delete('/:id', protectProduct, deleteProduct);

productsRouter.post('/categories', categoryValidators, createCategory);

productsRouter.patch(
  '/categories/:id',
  validateCategory,
  categoryValidators,
  updateCategory
);

module.exports = { productsRouter };
