const express = require("express");
const router = express.Router();
const {
  getAllSales,
  createSale,
  getSaleById,
  updateSale,
  getSaleByInvoice,
  getSalesByStatus,
  updateSaleStatus,
  getSaleDetails,
  createSaleDetail,
  updateSaleDetail,
} = require("../controllers/saleController");

// Sales routes
router.get("/", getAllSales);
router.post("/", createSale);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.get("/invoice/:numeroFactura", getSaleByInvoice);
router.get("/status/:estado", getSalesByStatus);
router.put("/:id/status", updateSaleStatus);

// Sales details routes
router.get("/:id/details", getSaleDetails);
router.post("/:id/details", createSaleDetail);
router.put("/:id/details/:detailId", updateSaleDetail);

module.exports = router;
