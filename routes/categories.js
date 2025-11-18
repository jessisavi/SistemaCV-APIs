const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// GET /api/categories
router.get("/", getAllCategories);

// POST /api/categories
router.post("/", createCategory);

// GET /api/categories/:id
router.get("/:id", getCategoryById);

// PUT /api/categories/:id
router.put("/:id", updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

module.exports = router;
