
require("dotenv").config();

const { DataSource } = require("typeorm");

const User = require("../entities/user");
const Category = require("../entities/category");
const Product = require("../entities/product");
const Cart = require("../entities/cart");
const CartItem = require("../entities/cartitem");
const Order = require("../entities/order");
const OrderItem = require("../entities/orderitem");

const yarnDb = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
  synchronize: true,
  logging: false,
  entities: [
    User,
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
  ],
  migrations: [],
});

module.exports = yarnDb;
