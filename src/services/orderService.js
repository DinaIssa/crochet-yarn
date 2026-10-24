
const yarnDb = require("../database/yarnDb");

const {
  findCartByUserId,
  findCartItems,
  findProductById,
  createOrder,
  createOrderItems,
  updateProductStock,
  clearCart,
  findOrdersByUserId,
  findOrderById,
  findOrderItems,
  restoreProductStock,
  findOrderForUpdate,
  findOrderItemsForUpdate,
  lockProductForRestock,
  updateOrderStatus,
} = require("../repositories/orderRepository");

async function createOrderFromCart(userId, shippingAddress = null) {
  try {
    return await yarnDb.transaction(async (manager) => {
      const cart = await findCartByUserId(userId, manager);

      if (!cart) {
        return { cartEmpty: true };
      }

      const cartItems = await findCartItems(cart.id, manager);

      if (cartItems.length === 0) {
        return { cartEmpty: true };
      }

      const sortedItems = [...cartItems].sort(
        (a, b) => a.product.id - b.product.id
      );

      const validatedItems = [];

      for (const item of sortedItems) {
        const product = await findProductById(
          item.product.id,
          manager
        );

        if (!product || !product.isActive) {
          return {
            productUnavailable: true,
            productName: item.product.name,
          };
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          return {
            invalidQuantity: true,
            productName: product.name,
          };
        }

        if (product.stock < item.quantity) {
          return {
            insufficientStock: true,
            productName: product.name,
            availableStock: product.stock,
            requestedQuantity: item.quantity,
          };
        }

        validatedItems.push({
          product,
          quantity: item.quantity,
          productName: product.name,
          unitPrice: Number(product.price),
        });
      }

      const totalAmount = Number(
        validatedItems
          .reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
          )
          .toFixed(2)
      );

      const order = await createOrder(
        {
          user: { id: userId },
          status: "pending",
          totalAmount,
          shippingAddress,
        },
        manager
      );

      const orderItems = validatedItems.map((item) => ({
        order: { id: order.id },
        product: { id: item.product.id },
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }));

      await createOrderItems(orderItems, manager);

      for (const item of validatedItems) {
        await updateProductStock(
          item.product,
          item.quantity,
          manager
        );
      }

      await clearCart(cart.id, manager);

      return {
        orderCreated: true,
        order: {
          id: order.id,
          status: order.status,
          totalAmount,
          shippingAddress: order.shippingAddress,
          items: orderItems.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: Number(
              (item.quantity * item.unitPrice).toFixed(2)
            ),
          })),
        },
      };
    });
  } catch (error) {
    if (error.message === "INSUFFICIENT_STOCK") {
      return { stockChanged: true };
    }

    throw error;
  }
}

async function getMyOrders(userId) {
  return findOrdersByUserId(userId);
}

async function getMyOrderDetails(userId, orderId) {
  const order = await findOrderById(orderId, userId);

  if (!order) {
    return null;
  }

  const items = await findOrderItems(order.id);

  return {
    id: order.id,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    items: items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(
        (Number(item.unitPrice) * item.quantity).toFixed(2)
      ),
    })),
  };
}

async function cancelMyOrder(userId, orderId) {
  return yarnDb.transaction(async (manager) => {
    // Lock the order so concurrent cancellation attempts serialize.
    const order = await findOrderForUpdate(
      orderId,
      userId,
      manager
    );

    if (!order) {
      return { orderNotFound: true };
    }

    if (order.status !== "pending") {
      return {
        cannotCancel: true,
        status: order.status,
      };
    }

    const items = await findOrderItemsForUpdate(
      order.id,
      manager
    );

    // Lock products in ascending ID order to reduce deadlock risk.
    const sortedItems = [...items].sort(
      (a, b) => (a.product?.id ?? 0) - (b.product?.id ?? 0)
    );

    for (const item of sortedItems) {
      if (!item.product) {
        continue;
      }

      const product = await lockProductForRestock(
        item.product.id,
        manager
      );

      // The product may have been deleted since the order was created.
      // In that case, there is no existing product stock to restore.
      if (product) {
        await restoreProductStock(
          product.id,
          item.quantity,
          manager
        );
      }
    }

    await updateOrderStatus(order, "cancelled", manager);

    return {
      orderCancelled: true,
      orderId: order.id,
      status: "cancelled",
    };
  });
}

module.exports = {
  createOrderFromCart,
  getMyOrders,
  getMyOrderDetails,
  cancelMyOrder,
};
