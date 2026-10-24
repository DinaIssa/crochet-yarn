
const yarnDb = require("../database/yarnDb");
const Order = require("../entities/order");
const OrderItem = require("../entities/orderitem");
const Cart = require("../entities/cart");
const CartItem = require("../entities/cartitem");
const Product = require("../entities/product");

async function findCartByUserId(userId, manager) {
  return manager.getRepository(Cart).findOne({
    where: { user: { id: userId } },
  });
}

async function findCartItems(cartId, manager) {
  return manager.getRepository(CartItem).find({
    where: { cart: { id: cartId } },
    relations: { product: true },
    order: { id: "ASC" },
  });
}

async function findProductById(productId, manager) {
  return manager.getRepository(Product).findOne({
    where: { id: productId },
    lock: { mode: "pessimistic_write" },
  });
}

async function createOrder(orderData, manager) {
  const repository = manager.getRepository(Order);
  const order = repository.create(orderData);
  return repository.save(order);
}

async function createOrderItems(items, manager) {
  const repository = manager.getRepository(OrderItem);
  const orderItems = repository.create(items);
  return repository.save(orderItems);
}

async function updateProductStock(product, quantity, manager) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("INVALID_STOCK_QUANTITY");
  }

  const result = await manager
    .getRepository(Product)
    .createQueryBuilder()
    .update(Product)
    .set({
      stock: () => '"stock" - :quantity',
    })
    .where('"id" = :id AND "stock" >= :quantity', {
      id: product.id,
      quantity,
    })
    .execute();

  if (result.affected !== 1) {
    throw new Error("INSUFFICIENT_STOCK");
  }
}

async function restoreProductStock(productId, quantity, manager) {
  if (!Number.isInteger(productId) || productId < 1) {
    throw new Error("INVALID_PRODUCT_ID");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("INVALID_STOCK_QUANTITY");
  }

  const result = await manager
    .getRepository(Product)
    .createQueryBuilder()
    .update(Product)
    .set({
      stock: () => '"stock" + :quantity',
    })
    .where('"id" = :id', {
      id: productId,
      quantity,
    })
    .execute();

  if (result.affected !== 1) {
    throw new Error("PRODUCT_NOT_FOUND_DURING_RESTOCK");
  }
}

async function clearCart(cartId, manager) {
  return manager.getRepository(CartItem).delete({
    cart: { id: cartId },
  });
}

async function findOrdersByUserId(userId) {
  return yarnDb.getRepository(Order).find({
    where: { user: { id: userId } },
    order: { createdAt: "DESC" },
  });
}

async function findOrderById(orderId, userId) {
  return yarnDb.getRepository(Order).findOne({
    where: {
      id: orderId,
      user: { id: userId },
    },
  });
}

// Find and lock the user's order during a transaction
async function findOrderForUpdate(orderId, userId, manager) {
  return manager.getRepository(Order).findOne({
    where: {
      id: orderId,
      user: { id: userId },
    },
    lock: { mode: "pessimistic_write" },
  });
}

// Load order items during a transaction
async function findOrderItemsForUpdate(orderId, manager) {
  return manager.getRepository(OrderItem).find({
    where: { order: { id: orderId } },
    relations: { product: true },
    order: { id: "ASC" },
  });
}

// Lock a product row before restoring its stock
async function lockProductForRestock(productId, manager) {
  return manager.getRepository(Product).findOne({
    where: { id: productId },
    lock: { mode: "pessimistic_write" },
  });
}

async function updateOrderStatus(order, status, manager) {
  order.status = status;
  return manager.getRepository(Order).save(order);
}

async function findOrderItems(orderId) {
  return yarnDb.getRepository(OrderItem).find({
    where: { order: { id: orderId } },
    order: { id: "ASC" },
  });
}

module.exports = {
  findCartByUserId,
  findCartItems,
  findProductById,
  createOrder,
  createOrderItems,
  updateProductStock,
  restoreProductStock,
  clearCart,
  findOrdersByUserId,
  findOrderById,
  findOrderForUpdate,
  findOrderItemsForUpdate,
  lockProductForRestock,
  updateOrderStatus,
  findOrderItems,
};
