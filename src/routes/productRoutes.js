
const express = require("express");

const {
  getAllProducts,
  getProductById,
  addProduct,
  editProduct,
  removeProduct,
} = require("../services/productService");

const router = express.Router();

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : null;
}

function validateProduct(body, isUpdate = false) {
  const data = {};
  const allowedFields = [
    "name",
    "description",
    "type",
    "price",
    "stock",
    "imageUrl",
    "categoryId",
    "isActive",
  ];

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { error: "Request body must be an object" };
  }

  const providedFields = Object.keys(body);

  if (providedFields.some((key) => !allowedFields.includes(key))) {
    return { error: "Request contains unsupported fields" };
  }

  if (!isUpdate && providedFields.length === 0) {
    return { error: "Product data is required" };
  }

  if (!isUpdate) {
    for (const field of [
      "name",
      "type",
      "price",
      "stock",
      "categoryId",
    ]) {
      if (body[field] === undefined) {
        return { error: `${field} is required` };
      }
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return { error: "Name must be a non-empty string" };
    }

    data.name = body.name.trim();
  }

  if (body.type !== undefined) {
    if (typeof body.type !== "string" || !body.type.trim()) {
      return { error: "Type must be a non-empty string" };
    }

    data.type = body.type.trim();
  }

  if (body.description !== undefined) {
    if (
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return { error: "Description must be a string or null" };
    }

    data.description = body.description;
  }

  if (body.imageUrl !== undefined) {
    if (
      body.imageUrl !== null &&
      typeof body.imageUrl !== "string"
    ) {
      return { error: "Image URL must be a string or null" };
    }

    data.imageUrl = body.imageUrl;
  }

  if (body.price !== undefined) {
    const price = Number(body.price);

    if (
      body.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return { error: "Price must be a non-negative number" };
    }

    data.price = price;
  }

  if (body.stock !== undefined) {
    if (
      body.stock === "" ||
      !Number.isSafeInteger(Number(body.stock)) ||
      Number(body.stock) < 0
    ) {
      return { error: "Stock must be a non-negative integer" };
    }

    data.stock = Number(body.stock);
  }

  if (body.categoryId !== undefined) {
    const categoryId = parseId(String(body.categoryId));

    if (categoryId === null) {
      return { error: "Category ID must be a positive integer" };
    }

    data.categoryId = categoryId;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return { error: "isActive must be true or false" };
    }

    data.isActive = body.isActive;
  }

  if (isUpdate && Object.keys(data).length === 0) {
    return { error: "Provide at least one valid field to update" };
  }

  return { data };
}

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await getAllProducts();

    return res.status(200).json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to retrieve products",
    });
  }
});

// Get one product
router.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to retrieve product",
    });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const validation = validateProduct(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const product = await addProduct(validation.data);

    if (product.categoryNotFound) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
});

// Update product
router.patch("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const validation = validateProduct(req.body, true);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const product = await editProduct(id, validation.data);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.categoryNotFound) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await removeProduct(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(409).json({
      message:
        "Product could not be deleted because it may be referenced by other records",
    });
  }
});

module.exports = router;
