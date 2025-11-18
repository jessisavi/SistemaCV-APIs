const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roleRoutes = require("./routes/roles");
const clientRoutes = require("./routes/clients");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const supplierRoutes = require("./routes/suppliers");
const quotationRoutes = require("./routes/quotations");
const saleRoutes = require("./routes/sales");
const reportRoutes = require("./routes/reports");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Para parsear JSON

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/reports", reportRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "API de Sistema CV funcionando",
    endpoints: {
      login: "POST /api/auth/login",
      logout: "POST /api/auth/logout",
      profile: "GET /api/auth/me/:id",
    },
    users: {
      all: "GET /api/users",
      byId: "GET /api/users/:id",
      update: "PUT /api/users/:id",
      permissions: "GET /api/users/:id/permissions",
    },
    roles: {
      all: "GET /api/roles",
      create: "POST /api/roles",
      byId: "GET /api/roles/:id",
      update: "PUT /api/roles/:id",
      delete: "DELETE /api/roles/:id",
    },
    clients: {
      all: "GET /api/clients",
      create: "POST /api/clients",
      byId: "GET /api/clients/:id",
      update: "PUT /api/clients/:id",
      delete: "DELETE /api/clients/:id",
      search: "GET /api/clients/search?term=",
      stats: "GET /api/clients/stats/summary",
    },
    products: {
      all: "GET /api/products",
      create: "POST /api/products",
      byId: "GET /api/products/:id",
      byCode: "GET /api/products/code/:code",
      update: "PUT /api/products/:id",
      delete: "DELETE /api/products/:id",
      search: "GET /api/products/search?term=",
      byCategory: "GET /api/products/category/:categoryId",
      lowStock: "GET /api/products/low-stock",

      categories: {
        all: "GET /api/categories",
        create: "POST /api/categories",
        byId: "GET /api/categories/:id",
        update: "PUT /api/categories/:id",
        delete: "DELETE /api/categories/:id",
      },
      suppliers: {
        all: "GET /api/suppliers",
        create: "POST /api/suppliers",
        byId: "GET /api/suppliers/:id",
        update: "PUT /api/suppliers/:id",
        delete: "DELETE /api/suppliers/:id",
      },
      quotations: {
        all: "GET /api/quotations",
        create: "POST /api/quotations",
        byId: "GET /api/quotations/:id",
        update: "PUT /api/quotations/:id",
        delete: "DELETE /api/quotations/:id",
        byClient: "GET /api/quotations/client/:clientId",
        byStatus: "GET /api/quotations/status/:estado",
        updateStatus: "PUT /api/quotations/:id/status",
        pdf: "GET /api/quotations/:id/pdf",
        details: {
          all: "GET /api/quotations/:id/details",
          create: "POST /api/quotations/:id/details",
          update: "PUT /api/quotations/:id/details/:detailId",
          delete: "DELETE /api/quotations/:id/details/:detailId",
        },
      },
      sales: {
        all: "GET /api/sales",
        create: "POST /api/sales",
        byId: "GET /api/sales/:id",
        update: "PUT /api/sales/:id",
        byInvoice: "GET /api/sales/invoice/:numeroFactura",
        byStatus: "GET /api/sales/status/:estado",
        updateStatus: "PUT /api/sales/:id/status",
        details: {
          all: "GET /api/sales/:id/details",
          create: "POST /api/sales/:id/details",
          update: "PUT /api/sales/:id/details/:detailId",
        },
      },
      reports: {
        sales: "GET /api/reports/sales?startDate={}&endDate={}",
        quotations: "GET /api/reports/quotations?startDate={}&endDate={}",
        mostSoldProducts: "GET /api/reports/products/most-sold",
        clientsSummary: "GET /api/reports/clients/summary",
        dashboardSummary: "GET /api/reports/dashboard/summary",
        generate: "POST /api/reports/generate",
        history: "GET /api/reports/history",
      }
    },
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
