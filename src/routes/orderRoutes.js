
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrderFromCart,
  getMyOrders,
  getMyOrderDetails,
  cancelMyOrder,
} = require("../services/orderService");

const router = express.Router();

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Create an order from the current user's cart
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { shippingAddress = null } = req.body;

    if (
      shippingAddress !== null &&
      (typeof shippingAddress !== "string" ||
        shippingAddress.trim().length === 0)
    ) {
      return res.status(400).json({
        message: "Shipping address must be a non-empty string",
      });
    }

    const result = await createOrderFromCart(
      req.user.userId,
      shippingAddress?.trim() || null
    );

    if (result.cartEmpty) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    if (result.productUnavailable) {
      return res.status(409).json({
        message: "A product in your cart is no longer available",
        productName: result.productName,
      });
    }

    if (result.invalidQuantity) {
      return res.status(400).json({
        message: "A product has an invalid quantity",
        productName: result.productName,
      });
    }

    if (result.insufficientStock) {
      return res.status(409).json({
        message: "Insufficient stock",
        productName: result.productName,
        availableStock: result.availableStock,
        requestedQuantity: result.requestedQuantity,
      });
    }

    if (result.stockChanged) {
      return res.status(409).json({
        message: "Stock changed during checkout. Please try again.",
      });
    }

    return res.status(201).json({
      message: "Order created successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Failed to create order",
    });
  }
});

// Get the current user's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await getMyOrders(req.user.userId);

    return res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Failed to retrieve orders",
    });
  }
});

// Get one order belonging to the current user
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const orderId = parseId(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await getMyOrderDetails(
      req.user.userId,
      orderId
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    return res.status(500).json({
      message: "Failed to retrieve order",
    });
  }
});

// Cancel an order belonging to the current user
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const orderId = parseId(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const result = await cancelMyOrder(
      req.user.userId,
      orderId
    );

    if (result.orderNotFound) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (result.cannotCancel) {
      return res.status(409).json({
        message: "This order cannot be cancelled",
        status: result.status,
      });
    }

    return res.status(200).json({
      message: "Order cancelled successfully",
      orderId: result.orderId,
      status: result.status,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      message: "Failed to cancel order",
    });
  }
});

module.exports = router;
