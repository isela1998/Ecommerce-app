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
  checkValidations,
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
  checkValidations,
  createProduct
);

productsRouter.patch(
  '/:id',
  protectProduct,
  updateProductValidators,
  checkValidations,
  updateProduct
);

productsRouter.delete('/:id', protectProduct, deleteProduct);

productsRouter.post(
  '/categories',
  categoryValidators,
  checkValidations,
  createCategory
);

productsRouter.patch(
  '/categories/:id',
  validateCategory,
  categoryValidators,
  checkValidations,
  updateCategory
);

module.exports = { productsRouter };
