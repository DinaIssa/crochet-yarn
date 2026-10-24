
const yarnDb = require("../database/yarnDb");
const Cart = require("../entities/cart");
const CartItem = require("../entities/cartitem");
const Product = require("../entities/product");

const cartRepository = yarnDb.getRepository(Cart);
const cartItemRepository = yarnDb.getRepository(CartItem);
const productRepository = yarnDb.getRepository(Product);

async function findCartByUserId(userId) {
  return await cartRepository.findOne({
    where: {
      user: { id: userId },
    },
    relations: {
      user: true,
    },
  });
}

async function createCart(userId) {
  const cart = cartRepository.create({
    user: { id: userId },
  });

  return await cartRepository.save(cart);
}

async function findCartItems(cartId) {
  return await cartItemRepository.find({
    where: {
      cart: { id: cartId },
    },
    relations: {
      product: {
        category: true,
      },
    },
    order: {
      id: "ASC",
    },
  });
}

async function findCartItemById(cartId, itemId) {
  return await cartItemRepository.findOne({
    where: {
      id: itemId,
      cart: { id: cartId },
    },
    relations: {
      product: true,
    },
  });
}

async function findCartItemByProduct(cartId, productId) {
  return await cartItemRepository.findOne({
    where: {
      cart: { id: cartId },
      product: { id: productId },
    },
    relations: {
      product: true,
    },
  });
}

async function findProductById(productId) {
  return await productRepository.findOneBy({
    id: productId,
  });
}

async function addCartItem(cartId, productId, quantity) {
  const item = cartItemRepository.create({
    cart: { id: cartId },
    product: { id: productId },
    quantity,
  });

  return await cartItemRepository.save(item);
}

async function updateCartItem(item, quantity) {
  item.quantity = quantity;
  return await cartItemRepository.save(item);
}

async function deleteCartItem(item) {
  await cartItemRepository.remove(item);
}

async function deleteCartItems(cartId) {
  await cartItemRepository.delete({
    cart: { id: cartId },
  });
}

module.exports = {
  findCartByUserId,
  createCart,
  findCartItems,
  findCartItemById,
  findCartItemByProduct,
  findProductById,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCartItems,
};
