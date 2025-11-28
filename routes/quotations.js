const express = require("express");
const router = express.Router();
const {
  getAllQuotations,
  createQuotation,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  getQuotationsByClient,
  getQuotationsByStatus,
  updateQuotationStatus,
  getQuotationDetails,
  addQuotationDetail,
  updateQuotationDetail,
  deleteQuotationDetail,
} = require("../controllers/quotationController");

router.get("/", getAllQuotations);
router.post("/", createQuotation);
router.get("/:id", getQuotationById);
router.put("/:id", updateQuotation);
router.delete("/:id", deleteQuotation);
router.get("/client/:clientId", getQuotationsByClient);
router.get("/status/:estado", getQuotationsByStatus);
router.put("/:id/status", updateQuotationStatus);
router.get("/:id/details", getQuotationDetails);
router.post("/:id/details", addQuotationDetail);
router.put("/:id/details/:detailId", updateQuotationDetail);
router.delete("/:id/details/:detailId", deleteQuotationDetail);

module.exports = router;
