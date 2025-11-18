const db = require("../config/database");

// Obtener todas las cotizaciones
const getAllQuotations = (req, res) => {
  const sql = `
        SELECT c.*, 
               CONCAT(cl.nombre, ' ', cl.apellido) as cliente_nombre,
               e.usuario as empleado_usuario
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.idcliente = cl.idcliente
        LEFT JOIN portalempleados e ON c.idempleado = e.idempleado
        ORDER BY c.fecha_creacion DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener cotizaciones:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener cotizaciones",
      });
    }

    res.json({
      success: true,
      quotations: results,
      total: results.length,
    });
  });
};

// Crear nueva cotización
const createQuotation = (req, res) => {
  const {
    idcliente,
    idempleado,
    fecha,
    valido_hasta,
    proyecto,
    notas,
    terminos,
    subtotal,
    descuento,
    iva,
    total,
    estado,
    detalles,
  } = req.body;

  // Validaciones básicas
  if (!idcliente || !fecha || !valido_hasta || !total) {
    return res.status(400).json({
      success: false,
      message: "Campos requeridos: idcliente, fecha, valido_hasta, total",
    });
  }

  const sqlCotizacion = `
        INSERT INTO cotizaciones 
        (idcliente, idempleado, fecha, valido_hasta, proyecto, notas, terminos, 
         subtotal, descuento, iva, total, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const cotizacionParams = [
    idcliente,
    idempleado || 1,
    fecha,
    valido_hasta,
    proyecto || null,
    notas || null,
    terminos || null,
    subtotal || 0,
    descuento || 0,
    iva || 0,
    total,
    estado || "PENDIENTE",
  ];

  db.query(sqlCotizacion, cotizacionParams, (err, results) => {
    if (err) {
      console.error("Error al crear cotización:", err);
      return res.status(500).json({
        success: false,
        message: "Error al crear cotización",
      });
    }

    const cotizacionId = results.insertId;

    // Insertar detalles si existen
    if (detalles && detalles.length > 0) {
      const sqlDetalle = `
                INSERT INTO cotizacion_detalles 
                (idcotizacion, idproducto, cantidad, precio_unitario, 
                 descuento_porcentaje, descuento_monto, total) 
                VALUES ?
            `;

      const detalleValues = detalles.map((detalle) => [
        cotizacionId,
        detalle.idproducto,
        detalle.cantidad,
        detalle.precio_unitario,
        detalle.descuento_porcentaje || null,
        detalle.descuento_monto || null,
        detalle.total,
      ]);

      db.query(sqlDetalle, [detalleValues], (err) => {
        if (err) {
          console.error("Error al crear detalles:", err);
          // Aún así retornamos éxito porque la cotización principal se creó
        }

        res.status(201).json({
          success: true,
          message: "Cotización creada correctamente",
          quotationId: cotizacionId,
          numeroCotizacion: `COT-${cotizacionId}`,
        });
      });
    } else {
      res.status(201).json({
        success: true,
        message: "Cotización creada correctamente",
        quotationId: cotizacionId,
        numeroCotizacion: `COT-${cotizacionId}`,
      });
    }
  });
};

// Obtener cotización por ID
const getQuotationById = (req, res) => {
  const { id } = req.params;

  const sqlCotizacion = `
        SELECT c.*, 
               CONCAT(cl.nombre, ' ', cl.apellido) as cliente_nombre,
               cl.correo_electronico as cliente_email,
               cl.celular as cliente_telefono,
               cl.direccion as cliente_direccion,
               cl.ciudad as cliente_ciudad,
               e.usuario as empleado_usuario
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.idcliente = cl.idcliente
        LEFT JOIN portalempleados e ON c.idempleado = e.idempleado
        WHERE c.idcotizacion = ?
    `;

  db.query(sqlCotizacion, [id], (err, cotizacionResults) => {
    if (err) {
      console.error("Error al obtener cotización:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener cotización",
      });
    }

    if (cotizacionResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cotización no encontrada",
      });
    }

    const cotizacion = cotizacionResults[0];

    // Obtener detalles de la cotización
    const sqlDetalles = `
            SELECT cd.*, 
                   p.nombre as producto_nombre,
                   p.descripcion as producto_descripcion,
                   p.codigo as producto_codigo
            FROM cotizacion_detalles cd
            LEFT JOIN productos p ON cd.idproducto = p.idproducto
            WHERE cd.idcotizacion = ?
        `;

    db.query(sqlDetalles, [id], (err, detallesResults) => {
      if (err) {
        console.error("Error al obtener detalles:", err);
        detallesResults = [];
      }

      cotizacion.detalles = detallesResults;

      res.json({
        success: true,
        quotation: cotizacion,
      });
    });
  });
};

// Actualizar cotización
const updateQuotation = (req, res) => {
  const { id } = req.params;
  const { proyecto, notas, terminos, valido_hasta, estado } = req.body;

  const sql = `
        UPDATE cotizaciones 
        SET proyecto = ?, notas = ?, terminos = ?, valido_hasta = ?, estado = ?
        WHERE idcotizacion = ?
    `;

  db.query(
    sql,
    [
      proyecto || null,
      notas || null,
      terminos || null,
      valido_hasta,
      estado || "PENDIENTE",
      id,
    ],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar cotización:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar cotización",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Cotización no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Cotización actualizada correctamente",
      });
    }
  );
};

// Eliminar cotización
const deleteQuotation = (req, res) => {
  const { id } = req.params;

  // Primero eliminar detalles
  const sqlDetalles = "DELETE FROM cotizacion_detalles WHERE idcotizacion = ?";

  db.query(sqlDetalles, [id], (err) => {
    if (err) {
      console.error("Error al eliminar detalles:", err);
    }

    // Luego eliminar cotización principal
    const sqlCotizacion = "DELETE FROM cotizaciones WHERE idcotizacion = ?";

    db.query(sqlCotizacion, [id], (err, results) => {
      if (err) {
        console.error("Error al eliminar cotización:", err);
        return res.status(500).json({
          success: false,
          message: "Error al eliminar cotización",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Cotización no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Cotización eliminada correctamente",
      });
    });
  });
};

// Obtener cotizaciones por cliente
const getQuotationsByClient = (req, res) => {
  const { clientId } = req.params;

  const sql = `
        SELECT c.*,
               CONCAT(cl.nombre, ' ', cl.apellido) as cliente_nombre
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.idcliente = cl.idcliente
        WHERE c.idcliente = ?
        ORDER BY c.fecha_creacion DESC
    `;

  db.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error("Error al obtener cotizaciones del cliente:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener cotizaciones del cliente",
      });
    }

    res.json({
      success: true,
      quotations: results,
      total: results.length,
    });
  });
};

// Obtener cotizaciones por estado
const getQuotationsByStatus = (req, res) => {
  const { estado } = req.params;

  const sql = `
        SELECT c.*,
               CONCAT(cl.nombre, ' ', cl.apellido) as cliente_nombre
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.idcliente = cl.idcliente
        WHERE c.estado = ?
        ORDER BY c.fecha_creacion DESC
    `;

  db.query(sql, [estado], (err, results) => {
    if (err) {
      console.error("Error al obtener cotizaciones por estado:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener cotizaciones por estado",
      });
    }

    res.json({
      success: true,
      quotations: results,
      total: results.length,
    });
  });
};

// Actualizar estado de cotización
const updateQuotationStatus = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({
      success: false,
      message: "El estado es requerido",
    });
  }

  const sql = "UPDATE cotizaciones SET estado = ? WHERE idcotizacion = ?";

  db.query(sql, [estado, id], (err, results) => {
    if (err) {
      console.error("Error al actualizar estado:", err);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar estado de cotización",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cotización no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Estado de cotización actualizado correctamente",
    });
  });
};

// Generar PDF de cotización
const getQuotationPDF = (req, res) => {
  const { id } = req.params;

  // Primero obtener los datos de la cotización
  const sqlCotizacion = `
        SELECT c.*, 
               CONCAT(cl.nombre, ' ', cl.apellido) as cliente_nombre,
               cl.correo_electronico as cliente_email,
               cl.celular as cliente_telefono,
               cl.direccion as cliente_direccion,
               cl.ciudad as cliente_ciudad,
               e.usuario as empleado_usuario
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.idcliente = cl.idcliente
        LEFT JOIN portalempleados e ON c.idempleado = e.idempleado
        WHERE c.idcotizacion = ?
    `;

  db.query(sqlCotizacion, [id], (err, cotizacionResults) => {
    if (err) {
      console.error("Error al obtener cotización para PDF:", err);
      return res.status(500).json({
        success: false,
        message: "Error al generar PDF",
      });
    }

    if (cotizacionResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cotización no encontrada",
      });
    }

    const cotizacion = cotizacionResults[0];

    // Obtener detalles
    const sqlDetalles = `
            SELECT cd.*, 
                   p.nombre as producto_nombre,
                   p.codigo as producto_codigo
            FROM cotizacion_detalles cd
            LEFT JOIN productos p ON cd.idproducto = p.idproducto
            WHERE cd.idcotizacion = ?
        `;

    db.query(sqlDetalles, [id], (err, detallesResults) => {
      if (err) {
        console.error("Error al obtener detalles para PDF:", err);
        detallesResults = [];
      }

      // En una implementación real, aquí generarías el PDF
      const pdfData = {
        cotizacion: cotizacion,
        detalles: detallesResults,
        fechaGeneracion: new Date().toISOString(),
        numeroDocumento: `PDF-COT-${id}`,
      };

      res.json({
        success: true,
        message: "Datos para generar PDF",
        pdfData: pdfData,
        downloadUrl: `/api/quotations/${id}/pdf/download`,
      });
    });
  });
};

// Obtener detalles de una cotización
const getQuotationDetails = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT cd.*, 
               p.nombre as producto_nombre,
               p.descripcion as producto_descripcion,
               p.codigo as producto_codigo,
               p.precio as producto_precio_actual
        FROM cotizacion_detalles cd
        LEFT JOIN productos p ON cd.idproducto = p.idproducto
        WHERE cd.idcotizacion = ?
        ORDER BY cd.id
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener detalles de cotización:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener detalles de cotización",
      });
    }

    res.json({
      success: true,
      details: results,
      total: results.length,
    });
  });
};

// Agregar detalle a cotización
const addQuotationDetail = (req, res) => {
  const { id } = req.params;
  const {
    idproducto,
    cantidad,
    precio_unitario,
    descuento_porcentaje,
    descuento_monto,
  } = req.body;

  // Validaciones
  if (!idproducto || !cantidad || !precio_unitario) {
    return res.status(400).json({
      success: false,
      message: "Campos requeridos: idproducto, cantidad, precio_unitario",
    });
  }

  // Calcular total
  let total = cantidad * precio_unitario;

  if (descuento_monto && descuento_monto > 0) {
    total -= descuento_monto;
  } else if (descuento_porcentaje && descuento_porcentaje > 0) {
    const descuento = total * (descuento_porcentaje / 100);
    total -= descuento;
  }

  // Asegurar que el total no sea negativo
  total = Math.max(0, total);

  const sql = `
        INSERT INTO cotizacion_detalles 
        (idcotizacion, idproducto, cantidad, precio_unitario, 
         descuento_porcentaje, descuento_monto, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [
      id,
      idproducto,
      cantidad,
      precio_unitario,
      descuento_porcentaje || null,
      descuento_monto || null,
      total,
    ],
    (err, results) => {
      if (err) {
        console.error("Error al agregar detalle:", err);
        return res.status(500).json({
          success: false,
          message: "Error al agregar detalle a cotización",
        });
      }

      // Actualizar totales de la cotización
      actualizarTotalesCotizacion(id);

      res.status(201).json({
        success: true,
        message: "Detalle agregado correctamente",
        detailId: results.insertId,
        total: total,
      });
    }
  );
};

// Actualizar detalle de cotización
const updateQuotationDetail = (req, res) => {
  const { id, detailId } = req.params;
  const { cantidad, precio_unitario, descuento_porcentaje, descuento_monto } =
    req.body;

  // Validaciones
  if (!cantidad || !precio_unitario) {
    return res.status(400).json({
      success: false,
      message: "Campos requeridos: cantidad, precio_unitario",
    });
  }

  // Calcular nuevo total
  let total = cantidad * precio_unitario;

  if (descuento_monto && descuento_monto > 0) {
    total -= descuento_monto;
  } else if (descuento_porcentaje && descuento_porcentaje > 0) {
    const descuento = total * (descuento_porcentaje / 100);
    total -= descuento;
  }

  // Asegurar que el total no sea negativo
  total = Math.max(0, total);

  const sql = `
        UPDATE cotizacion_detalles 
        SET cantidad = ?, precio_unitario = ?, 
            descuento_porcentaje = ?, descuento_monto = ?, total = ?
        WHERE id = ? AND idcotizacion = ?
    `;

  db.query(
    sql,
    [
      cantidad,
      precio_unitario,
      descuento_porcentaje || null,
      descuento_monto || null,
      total,
      detailId,
      id,
    ],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar detalle:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar detalle de cotización",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Detalle no encontrado",
        });
      }

      // Actualizar totales de la cotización
      actualizarTotalesCotizacion(id);

      res.json({
        success: true,
        message: "Detalle actualizado correctamente",
        total: total,
      });
    }
  );
};

// Eliminar detalle de cotización
const deleteQuotationDetail = (req, res) => {
  const { id, detailId } = req.params;

  const sql =
    "DELETE FROM cotizacion_detalles WHERE id = ? AND idcotizacion = ?";

  db.query(sql, [detailId, id], (err, results) => {
    if (err) {
      console.error("Error al eliminar detalle:", err);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar detalle de cotización",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Detalle no encontrado",
      });
    }

    // Actualizar totales de la cotización
    actualizarTotalesCotizacion(id);

    res.json({
      success: true,
      message: "Detalle eliminado correctamente",
    });
  });
};

// Función auxiliar para actualizar totales de la cotización
const actualizarTotalesCotizacion = (cotizacionId) => {
  const sql = `
        SELECT 
            COALESCE(SUM(total), 0) as subtotal,
            COALESCE(SUM(descuento_monto), 0) as descuento_total
        FROM cotizacion_detalles 
        WHERE idcotizacion = ?
    `;

  db.query(sql, [cotizacionId], (err, results) => {
    if (err) {
      console.error("Error al calcular totales:", err);
      return;
    }

    if (results.length > 0) {
      const subtotal = results[0].subtotal;
      const descuento = results[0].descuento_total;
      const iva = subtotal * 0.19; // 19% IVA
      const total = subtotal + iva - descuento;

      const updateSql = `
                UPDATE cotizaciones 
                SET subtotal = ?, descuento = ?, iva = ?, total = ?
                WHERE idcotizacion = ?
            `;

      db.query(
        updateSql,
        [subtotal, descuento, iva, total, cotizacionId],
        (err) => {
          if (err) {
            console.error("Error al actualizar totales:", err);
          }
        }
      );
    }
  });
};

module.exports = {
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
};
