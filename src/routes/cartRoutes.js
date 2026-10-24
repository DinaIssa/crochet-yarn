
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUserCart,
  addProductToCart,
  changeCartItemQuantity,
  removeCartItem,
  clearUserCart,
} = require("../services/cartService");

const router = express.Router();

function parsePositiveInteger(value) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    !/^[1-9]\d*$/.test(String(value))
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) ? number : null;
}

function validateQuantity(value) {
  return parsePositiveInteger(value);
}

function sendCartError(res, result) {
  if (result.productNotFound) {
    return res.status(404).json({
      message: "Product not found or inactive",
    });
  }

  if (result.outOfStock) {
    return res.status(409).json({
      message: "Product is out of stock",
    });
  }

  if (result.insufficientStock) {
    return res.status(409).json({
      message: "Requested quantity exceeds available stock",
      availableStock: result.availableStock,
    });
  }

  if (result.itemNotFound) {
    return res.status(404).json({
      message: "Cart item not found",
    });
  }

  return null;
}

// Get current user's cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await getUserCart(req.user.userId);

    return res.status(200).json({
      message: "Cart retrieved successfully",
      cart,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to retrieve cart",
    });
  }
});

// Add product to cart
router.post("/items", authMiddleware, async (req, res) => {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Request body must be an object",
      });
    }

    const allowedFields = ["productId", "quantity"];

    if (
      Object.keys(req.body).some(
        (key) => !allowedFields.includes(key)
      )
    ) {
      return res.status(400).json({
        message: "Request contains unsupported fields",
      });
    }

    const productId = parsePositiveInteger(req.body.productId);
    const quantity = req.body.quantity === undefined
      ? 1
      : validateQuantity(req.body.quantity);

    if (productId === null) {
      return res.status(400).json({
        message: "Product ID must be a positive integer",
      });
    }

    if (quantity === null) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    const result = await addProductToCart(
      req.user.userId,
      productId,
      quantity
    );

    const errorResponse = sendCartError(res, result);

    if (errorResponse) {
      return errorResponse;
    }

    return res.status(200).json({
      message: "Product added to cart successfully",
      cart: result.cart,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to add product to cart",
    });
  }
});

// Update quantity of a cart item
router.patch("/items/:id", authMiddleware, async (req, res) => {
  try {
    const itemId = parsePositiveInteger(req.params.id);

    if (itemId === null) {
      return res.status(400).json({
        message: "Cart item ID must be a positive integer",
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Request body must be an object",
      });
    }

    if (
      Object.keys(req.body).length !== 1 ||
      !Object.prototype.hasOwnProperty.call(req.body, "quantity")
    ) {
      return res.status(400).json({
        message: "Only quantity can be updated",
      });
    }

    const quantity = validateQuantity(req.body.quantity);

    if (quantity === null) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    const result = await changeCartItemQuantity(
      req.user.userId,
      itemId,
      quantity
    );

    const errorResponse = sendCartError(res, result);

    if (errorResponse) {
      return errorResponse;
    }

    return res.status(200).json({
      message: "Cart item quantity updated successfully",
      cart: result.cart,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to update cart item",
    });
  }
});

// Remove one item
router.delete("/items/:id", authMiddleware, async (req, res) => {
  try {
    const itemId = parsePositiveInteger(req.params.id);

    if (itemId === null) {
      return res.status(400).json({
        message: "Cart item ID must be a positive integer",
      });
    }

    const result = await removeCartItem(
      req.user.userId,
      itemId
    );

    const errorResponse = sendCartError(res, result);

    if (errorResponse) {
      return errorResponse;
    }

    return res.status(200).json({
      message: "Cart item removed successfully",
      cart: result.cart,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to remove cart item",
    });
  }
});

// Clear current user's cart
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const result = await clearUserCart(req.user.userId);

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart: result.cart,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to clear cart",
    });
  }
});

module.exports = router;
