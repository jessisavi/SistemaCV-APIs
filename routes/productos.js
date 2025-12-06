const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getLowStockProducts,
  getCriticalStockProducts,
  getOutOfStockProducts,
  getProductByCode,
} = require("../controllers/productosController");

// GET /api/products
router.get("/", getAllProducts);

// POST /api/products
router.post("/", createProduct);

// GET /api/products/low-stock
router.get("/low-stock", getLowStockProducts);

// GET /api/products/critical-stock
router.get("/critical-stock", getCriticalStockProducts);

// GET /api/products/out-of-stock
router.get("/out-of-stock", getOutOfStockProducts);

// GET /api/products/search
router.get("/search", searchProducts);

// GET /api/products/category/:categoryId
router.get("/category/:categoryId", getProductsByCategory);

// GET /api/products/code/:code
router.get("/code/:code", getProductByCode);

// GET /api/products/:id
router.get("/:id", getProductById);

// PUT /api/products/:id
router.put("/:id", updateProduct);

// DELETE /api/products/:id
router.delete("/:id", deleteProduct);

module.exports = router;
