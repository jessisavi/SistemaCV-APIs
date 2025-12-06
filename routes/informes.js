const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getQuotationsReport,
  getMostSoldProducts,
  getClientsSummary,
  getDashboardSummary,
  generateReport,
  getReportHistory,
} = require("../controllers/informesController");

router.get("/sales", getSalesReport);
router.get("/quotations", getQuotationsReport);
router.get("/products/most-sold", getMostSoldProducts);
router.get("/clients/summary", getClientsSummary);
router.get("/dashboard/summary", getDashboardSummary);
router.post("/generate", generateReport);
router.get("/history", getReportHistory);

module.exports = router;
