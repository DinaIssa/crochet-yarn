
const express = require("express");

const {
  getAllCategories,
  getCategoryById,
  addCategory,
  editCategory,
  removeCategory,
} = require("../services/categoryService");

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await getAllCategories();

    return res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to retrieve categories",
    });
  }
});

// Get one category
router.get("/:id", async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category retrieved successfully",
      category,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to retrieve category",
    });
  }
});

// Create category
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await addCategory({
      name: name.trim(),
      description: description ?? null,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A category with this name already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create category",
    });
  }
});

// Update category
router.patch("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryData = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Category name must be a non-empty string",
        });
      }

      categoryData.name = name.trim();
    }

    if (description !== undefined) {
      if (
        description !== null &&
        typeof description !== "string"
      ) {
        return res.status(400).json({
          message: "Description must be a string or null",
        });
      }

      categoryData.description = description;
    }

    if (Object.keys(categoryData).length === 0) {
      return res.status(400).json({
        message: "Provide a name or description to update",
      });
    }

    const category = await editCategory(
      req.params.id,
      categoryData
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A category with this name already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update category",
    });
  }
});

// Delete category


router.delete("/:id", async (req, res) => {
  try {
    const result = await removeCategory(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (result.blocked) {
      return res.status(409).json({
        message: "Cannot delete category because it has associated products",
        productsCount: result.productsCount,
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
      category: result.category,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to delete category",
    });
  }
});


module.exports = router;
