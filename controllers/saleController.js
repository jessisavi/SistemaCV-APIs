const db = require("../config/database");

// Obtener todas las ventas
const getAllSales = (req, res) => {
  const sql = `
        SELECT v.*, 
               CONCAT(c.nombre, ' ', c.apellido) as cliente_nombre,
               e.usuario as empleado_usuario
        FROM ventas v
        LEFT JOIN clientes c ON v.idcliente = c.idcliente
        LEFT JOIN portalempleados e ON v.idempleado = e.idempleado
        ORDER BY v.fecha_creacion DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener ventas:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener ventas",
      });
    }

    res.json({
      success: true,
      sales: results,
    });
  });
};

// Crear nueva venta
const createSale = (req, res) => {
  const {
    idcliente,
    idempleado,
    fecha,
    metodoPago,
    estado,
    subtotal,
    descuento,
    iva,
    total,
    notas,
    detalles,
  } = req.body;

  // Validaciones básicas
  if (!idcliente || !fecha || !metodoPago || !estado || !total) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos requeridos",
    });
  }

  const connection = db;

  // Generar número de factura
  const getInvoiceNumber = () => {
    return new Promise((resolve, reject) => {
      const countSql =
        "SELECT COUNT(*) as total FROM ventas WHERE YEAR(fecha_creacion) = YEAR(NOW())";
      connection.query(countSql, (err, results) => {
        if (err) return reject(err);

        const total = results[0].total + 1;
        const invoiceNumber = `FAC-${new Date().getFullYear()}-${total
          .toString()
          .padStart(5, "0")}`;
        resolve(invoiceNumber);
      });
    });
  };

  // Insertar venta
  const insertSale = (invoiceNumber) => {
    return new Promise((resolve, reject) => {
      const saleSql = `
                INSERT INTO ventas (numero_factura, idcliente, idempleado, fecha, metodo_pago, 
                                  estado, subtotal, descuento, iva, total, notas)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      connection.query(
        saleSql,
        [
          invoiceNumber,
          idcliente,
          idempleado,
          fecha,
          metodoPago,
          estado,
          subtotal,
          descuento,
          iva,
          total,
          notas,
        ],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  };

  // Insertar detalles
  const insertDetails = (saleId) => {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return Promise.resolve();
    }

    const detailSql = `
            INSERT INTO venta_detalles (idventa, idproducto, cantidad, precio_unitario, total)
            VALUES ?
        `;

    const detailValues = detalles.map((detalle) => [
      saleId,
      detalle.idproducto,
      detalle.cantidad,
      detalle.precioUnitario,
      detalle.total,
    ]);

    return new Promise((resolve, reject) => {
      connection.query(detailSql, [detailValues], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

  // Ejecutar transacción
  getInvoiceNumber()
    .then(insertSale)
    .then(insertDetails)
    .then(() => {
      res.status(201).json({
        success: true,
        message: "Venta creada correctamente",
      });
    })
    .catch((err) => {
      console.error("Error al crear venta:", err);
      res.status(500).json({
        success: false,
        message: "Error al crear venta",
      });
    });
};

// Obtener venta por ID
const getSaleById = (req, res) => {
  const { id } = req.params;

  const saleSql = `
        SELECT v.*, 
               CONCAT(c.nombre, ' ', c.apellido) as cliente_nombre,
               c.correo_electronico as cliente_correo,
               c.celular as cliente_celular,
               e.usuario as empleado_usuario
        FROM ventas v
        LEFT JOIN clientes c ON v.idcliente = c.idcliente
        LEFT JOIN portalempleados e ON v.idempleado = e.idempleado
        WHERE v.idventa = ?
    `;

  db.query(saleSql, [id], (err, saleResults) => {
    if (err) {
      console.error("Error al obtener venta:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener venta",
      });
    }

    if (saleResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      });
    }

    // Obtener detalles de la venta
    const detailsSql = `
            SELECT vd.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
            FROM venta_detalles vd
            LEFT JOIN productos p ON vd.idproducto = p.idproducto
            WHERE vd.idventa = ?
        `;

    db.query(detailsSql, [id], (err, detailResults) => {
      if (err) {
        console.error("Error al obtener detalles:", err);
        return res.status(500).json({
          success: false,
          message: "Error al obtener detalles de venta",
        });
      }

      const sale = saleResults[0];
      sale.detalles = detailResults;

      res.json({
        success: true,
        sale: sale,
      });
    });
  });
};

// Actualizar venta
const updateSale = (req, res) => {
  const { id } = req.params;
  const {
    idcliente,
    fecha,
    metodoPago,
    estado,
    subtotal,
    descuento,
    iva,
    total,
    notas,
  } = req.body;

  const sql = `
        UPDATE ventas 
        SET idcliente = ?, fecha = ?, metodo_pago = ?, estado = ?, 
            subtotal = ?, descuento = ?, iva = ?, total = ?, notas = ?
        WHERE idventa = ?
    `;

  db.query(
    sql,
    [
      idcliente,
      fecha,
      metodoPago,
      estado,
      subtotal,
      descuento,
      iva,
      total,
      notas,
      id,
    ],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar venta:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar venta",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Venta no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Venta actualizada correctamente",
      });
    }
  );
};

// Obtener venta por número de factura
const getSaleByInvoice = (req, res) => {
  const { numeroFactura } = req.params;

  const sql = `
        SELECT v.*, 
               CONCAT(c.nombre, ' ', c.apellido) as cliente_nombre,
               c.correo_electronico as cliente_correo,
               e.usuario as empleado_usuario
        FROM ventas v
        LEFT JOIN clientes c ON v.idcliente = c.idcliente
        LEFT JOIN portalempleados e ON v.idempleado = e.idempleado
        WHERE v.numero_factura = ?
    `;

  db.query(sql, [numeroFactura], (err, results) => {
    if (err) {
      console.error("Error al obtener venta por factura:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener venta",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      });
    }

    res.json({
      success: true,
      sale: results[0],
    });
  });
};

// Obtener ventas por estado
const getSalesByStatus = (req, res) => {
  const { estado } = req.params;

  const sql = `
        SELECT v.*, 
               CONCAT(c.nombre, ' ', c.apellido) as cliente_nombre,
               e.usuario as empleado_usuario
        FROM ventas v
        LEFT JOIN clientes c ON v.idcliente = c.idcliente
        LEFT JOIN portalempleados e ON v.idempleado = e.idempleado
        WHERE v.estado = ?
        ORDER BY v.fecha_creacion DESC
    `;

  db.query(sql, [estado], (err, results) => {
    if (err) {
      console.error("Error al obtener ventas por estado:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener ventas",
      });
    }

    res.json({
      success: true,
      sales: results,
    });
  });
};

// Actualizar estado de venta
const updateSaleStatus = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({
      success: false,
      message: "El estado es requerido",
    });
  }

  const sql = "UPDATE ventas SET estado = ? WHERE idventa = ?";

  db.query(sql, [estado, id], (err, results) => {
    if (err) {
      console.error("Error al actualizar estado:", err);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar estado",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Estado de venta actualizado correctamente",
    });
  });
};

// Obtener detalles de venta
const getSaleDetails = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT vd.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
        FROM venta_detalles vd
        LEFT JOIN productos p ON vd.idproducto = p.idproducto
        WHERE vd.idventa = ?
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener detalles:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener detalles de venta",
      });
    }

    res.json({
      success: true,
      details: results,
    });
  });
};

// Crear detalle de venta
const createSaleDetail = (req, res) => {
  const { id } = req.params;
  const { idproducto, cantidad, precioUnitario, total } = req.body;

  if (!idproducto || !cantidad || !precioUnitario || !total) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos requeridos",
    });
  }

  const sql = `
        INSERT INTO venta_detalles (idventa, idproducto, cantidad, precio_unitario, total)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [id, idproducto, cantidad, precioUnitario, total],
    (err, results) => {
      if (err) {
        console.error("Error al crear detalle:", err);
        return res.status(500).json({
          success: false,
          message: "Error al crear detalle de venta",
        });
      }

      res.status(201).json({
        success: true,
        message: "Detalle de venta creado correctamente",
        detailId: results.insertId,
      });
    }
  );
};

// Actualizar detalle de venta
const updateSaleDetail = (req, res) => {
  const { id, detailId } = req.params;
  const { cantidad, precioUnitario, total } = req.body;

  const sql = `
        UPDATE venta_detalles 
        SET cantidad = ?, precio_unitario = ?, total = ?
        WHERE id = ? AND idventa = ?
    `;

  db.query(
    sql,
    [cantidad, precioUnitario, total, detailId, id],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar detalle:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar detalle de venta",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Detalle de venta no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Detalle de venta actualizado correctamente",
      });
    }
  );
};

module.exports = {
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
};
