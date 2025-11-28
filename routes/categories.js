const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryExists,
  searchCategoriesByName,
  getCategoriesWithStock,
  countProductsByCategory,
} = require("../controllers/categoryController");

// GET /api/categories
router.get("/", getAllCategories);

// POST /api/categories
router.post("/", createCategory);

// GET /api/categories/with-stock
router.get("/with-stock", getCategoriesWithStock);

// GET /api/categories/search/:nombre
router.get("/search/:nombre", searchCategoriesByName);

// GET /api/categories/exists/:nombre
router.get("/exists/:nombre", categoryExists);

// GET /api/categories/:id/products/count
router.get("/:id/products/count", countProductsByCategory);

// GET /api/categories/name/:nombre
router.get("/name/:nombre", getCategoryByName);

// GET /api/categories/:id
router.get("/:id", getCategoryById);

// PUT /api/categories/:id
router.put("/:id", updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

module.exports = router;
