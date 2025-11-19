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
  getQuotationPDF,
  getQuotationDetails,
  addQuotationDetail,
  updateQuotationDetail,
  deleteQuotationDetail,
} = require("../controllers/quotationController");

// GET /api/quotations
router.get("/", getAllQuotations);

// POST /api/quotations
router.post("/", createQuotation);

// GET /api/quotations/:id
router.get("/:id", getQuotationById);

// PUT /api/quotations/:id
router.put("/:id", updateQuotation);

// DELETE /api/quotations/:id
router.delete("/:id", deleteQuotation);

// GET /api/quotations/client/:clientId
router.get("/client/:clientId", getQuotationsByClient);

// GET /api/quotations/status/:estado
router.get("/status/:estado", getQuotationsByStatus);

// PUT /api/quotations/:id/status
router.put("/:id/status", updateQuotationStatus);

// GET /api/quotations/:id/pdf
router.get("/:id/pdf", getQuotationPDF);

// Rutas para detalles de cotización
router.get("/:id/details", getQuotationDetails);
router.post("/:id/details", addQuotationDetail);
router.put("/:id/details/:detailId", updateQuotationDetail);
router.delete("/:id/details/:detailId", deleteQuotationDetail);

module.exports = router;
