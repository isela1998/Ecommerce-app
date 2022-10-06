// Models
const { Product } = require('./product.model');
const { Category } = require('./category.model');
const { ProductImg } = require('./productImg.model');
const { User } = require('./user.model');
const { Order } = require('./order.model');
const { Cart } = require('./cart.model');
const { ProductInCart } = require('./productInCart.model');

const associateModels = () => {
  // 1 User <--> M Orders
  User.hasMany(Order, { foreignKey: 'userId' });
  Order.belongsTo(User);

  // 1 User <--> M Products
  User.hasMany(Product, { foreignKey: 'userId' });
  Product.belongsTo(User);

  // 1 User <--> 1 Cart
  User.hasOne(Cart, { foreignKey: 'userId' });
  Cart.belongsTo(User);

  // 1 Product <--> M ProductImgs
  Product.hasMany(ProductImg, { foreignKey: 'productId' });
  ProductImg.belongsTo(Product);

  // 1 Category <--> 1 Product
  Category.hasOne(Product, { foreignKey: 'categoryId' });
  Product.belongsTo(Category);

  // 1 Cart <--> M ProductsInCarts
  Cart.hasMany(ProductInCart, { foreignKey: 'cartId' });
  ProductInCart.belongsTo(Cart);

  // 1 Product <--> 1 ProductInCart
  Product.hasOne(ProductInCart, { foreignKey: 'productId' });
  ProductInCart.belongsTo(Product);

  // 1 Order <--> 1 Cart
  Cart.hasOne(Order, { foreignKey: 'cartId' });
  Order.belongsTo(Cart);
};

module.exports = { associateModels };
