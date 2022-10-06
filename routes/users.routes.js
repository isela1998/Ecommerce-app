const express = require('express');

// Controllers
const {
  signup,
  login,
  getAllProductsUser,
  updateUser,
  deleteUser,
  getAllOrdersUser,
  getOrderUser,
} = require('../controllers/users.controller');

// Middlewares
const { validateUser } = require('../middlewares/find.middlewares');

const {
  protectSession,
  protectUsersAccount,
} = require('../middlewares/auth.middlewares');
const {
  signupValidators,
  updateUserValidators,
} = require('../middlewares/validators.middlewares');

const usersRouter = express.Router();

usersRouter.post('/', signupValidators, signup);

usersRouter.post('/login', login);

// Protecting below endpoints
usersRouter.use(protectSession);

usersRouter.get('/me', getAllProductsUser);

usersRouter.patch(
  '/:id',
  validateUser,
  protectUsersAccount,
  updateUserValidators,
  updateUser
);

usersRouter.delete('/:id', validateUser, protectUsersAccount, deleteUser);

usersRouter.get('/orders', getAllOrdersUser);

usersRouter.get('/orders/:id', getOrderUser);

module.exports = { usersRouter };
