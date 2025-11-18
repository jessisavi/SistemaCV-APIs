const express = require("express");
const router = express.Router();
const {
  getAllSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

// GET /api/suppliers
router.get("/", getAllSuppliers);

// POST /api/suppliers
router.post("/", createSupplier);

// GET /api/suppliers/:id
router.get("/:id", getSupplierById);

// PUT /api/suppliers/:id
router.put("/:id", updateSupplier);

// DELETE /api/suppliers/:id
router.delete("/:id", deleteSupplier);

module.exports = router;
