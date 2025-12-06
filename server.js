const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/usuarios");
const roleRoutes = require("./routes/roles");
const clientRoutes = require("./routes/clientes");
const productRoutes = require("./routes/productos");
const categoryRoutes = require("./routes/categorias");
const supplierRoutes = require("./routes/proveedores");
const quotationRoutes = require("./routes/cotizaciones");
const saleRoutes = require("./routes/ventas");
const reportRoutes = require("./routes/informes");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Para parsear JSON

const session = require("express-session");

app.use(
  session({
    secret: "tu-clave-secreta",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/clientes", clientRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/categorias", categoryRoutes);
app.use("/api/proveedores", supplierRoutes);
app.use("/api/cotizaciones", quotationRoutes);
app.use("/api/ventas", saleRoutes);
app.use("/api/informes", reportRoutes);

// Ruta de prueba con documentación
app.get("/", (req, res) => {
  res.json({
    message: "API de Sistema CV funcionando",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/me/:id",
        session: "GET /api/auth/session",
      },
      usuarios: {
        all: "GET /api/usuarios",
        byId: "GET /api/usuarios/:id",
        update: "PUT /api/usuarios/:id",
        permissions: "GET /api/usuarios/:id/permissions",
      },
      roles: {
        all: "GET /api/roles",
        create: "POST /api/roles",
        byId: "GET /api/roles/:id",
        update: "PUT /api/roles/:id",
        delete: "DELETE /api/roles/:id",
      },
      clientes: {
        all: "GET /api/clientes",
        create: "POST /api/clientes",
        byId: "GET /api/clientes/:id",
        update: "PUT /api/clientes/:id",
        delete: "DELETE /api/clientes/:id",
        search: "GET /api/clientes/search?term=",
        stats: "GET /api/clientes/stats",
      },
      productos: {
        all: "GET /api/productos",
        create: "POST /api/productos",
        byId: "GET /api/productos/:id",
        byCode: "GET /api/productos/code/:code",
        update: "PUT /api/productos/:id",
        delete: "DELETE /api/productos/:id",
        search: "GET /api/productos/search?term=",
        byCategory: "GET /api/productos/category/:categoryId",
        lowStock: "GET /api/productos/low-stock",
        criticalStock: "GET /api/productos/critical-stock",
        outOfStock: "GET /api/productos/out-of-stock",
      },
      categorias: {
        all: "GET /api/categorias",
        create: "POST /api/categorias",
        byId: "GET /api/categorias/:id",
        update: "PUT /api/categorias/:id",
        delete: "DELETE /api/categorias/:id",
        search: "GET /api/categorias/search/:nombre",
        exists: "GET /api/categorias/exists/:nombre",
        withStock: "GET /api/categorias/with-stock",
        countProducts: "GET /api/categorias/:id/products/count",
      },
      proveedores: {
        all: "GET /api/proveedores",
        create: "POST /api/proveedores",
        byId: "GET /api/proveedores/:id",
        update: "PUT /api/proveedores/:id",
        delete: "DELETE /api/proveedores/:id",
        search: "GET /api/proveedores/search/:nombre",
      },
      cotizaciones: {
        all: "GET /api/cotizaciones",
        create: "POST /api/cotizaciones",
        byId: "GET /api/cotizaciones/:id",
        update: "PUT /api/cotizaciones/:id",
        delete: "DELETE /api/cotizaciones/:id",
        byClient: "GET /api/cotizaciones/client/:clientId",
        byStatus: "GET /api/cotizaciones/status/:estado",
        updateStatus: "PUT /api/cotizaciones/:id/status",
        details: {
          all: "GET /api/cotizaciones/:id/details",
          create: "POST /api/cotizaciones/:id/details",
          update: "PUT /api/cotizaciones/:id/details/:detailId",
          delete: "DELETE /api/cotizaciones/:id/details/:detailId",
        },
      },
      ventas: {
        all: "GET /api/ventas",
        create: "POST /api/ventas",
        byId: "GET /api/ventas/:id",
        update: "PUT /api/ventas/:id",
        byInvoice: "GET /api/ventas/invoice/:numeroFactura",
        byStatus: "GET /api/ventas/status/:estado",
        updateStatus: "PUT /api/ventas/:id/status",
        details: {
          all: "GET /api/ventas/:id/details",
          create: "POST /api/ventas/:id/details",
          update: "PUT /api/ventas/:id/details/:detailId",
        },
      },
      informes: {
        sales: "GET /api/informes/sales?startDate={}&endDate={}",
        quotations: "GET /api/informes/quotations?startDate={}&endDate={}",
        mostSoldProducts: "GET /api/informes/products/most-sold",
        clientsSummary: "GET /api/informes/clients/summary",
        dashboardSummary: "GET /api/informes/dashboard/summary",
        generate: "POST /api/informes/generate",
        history: "GET /api/informes/history",
      },
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
