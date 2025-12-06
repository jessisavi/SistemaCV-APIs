const db = require("../config/database");

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

const createQuotation = (req, res) => {
  const {
    idcliente,
    idempleado,
    fecha_creacion,
    valido_hasta,
    proyecto,
    notas,
    subtotal,
    descuento,
    iva,
    total,
    estado,
    detalles,
  } = req.body;

  if (!idcliente || !fecha_creacion || !valido_hasta || !total) {
    return res.status(400).json({
      success: false,
      message:
        "Campos requeridos: idcliente, fecha_creacion, valido_hasta, total",
    });
  }

  const sqlCotizacion = `
    INSERT INTO cotizaciones 
    (idcliente, idempleado, fecha_creacion, valido_hasta, proyecto, notas, 
     subtotal, descuento, iva, total, estado) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const cotizacionParams = [
    idcliente,
    idempleado || 1,
    fecha_creacion,
    valido_hasta,
    proyecto || null,
    notas || null,
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
        message: "Error al crear cotización: " + err.message,
      });
    }

    const cotizacionId = results.insertId;

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
          return res.status(500).json({
            success: false,
            message: "Cotización creada pero error en detalles: " + err.message,
          });
        }

        res.status(201).json({
          success: true,
          message: "Cotización creada correctamente",
          quotationId: cotizacionId,
        });
      });
    } else {
      res.status(201).json({
        success: true,
        message: "Cotización creada correctamente",
        quotationId: cotizacionId,
      });
    }
  });
};

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

const updateQuotation = (req, res) => {
  const { id } = req.params;
  const { proyecto, notas, valido_hasta, estado } = req.body;

  const sql = `
    UPDATE cotizaciones 
    SET proyecto = ?, notas = ?, valido_hasta = ?, estado = ?
    WHERE idcotizacion = ?
  `;

  db.query(
    sql,
    [proyecto || null, notas || null, valido_hasta, estado || "PENDIENTE", id],
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

const deleteQuotation = (req, res) => {
  const { id } = req.params;

  const sqlDetalles = "DELETE FROM cotizacion_detalles WHERE idcotizacion = ?";

  db.query(sqlDetalles, [id], (err) => {
    if (err) {
      console.error("Error al eliminar detalles:", err);
    }

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
    ORDER BY cd.id_cot_det
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

const addQuotationDetail = (req, res) => {
  const { id } = req.params;
  const {
    idproducto,
    cantidad,
    precio_unitario,
    descuento_porcentaje,
    descuento_monto,
  } = req.body;

  if (!idproducto || !cantidad || !precio_unitario) {
    return res.status(400).json({
      success: false,
      message: "Campos requeridos: idproducto, cantidad, precio_unitario",
    });
  }

  let total = cantidad * precio_unitario;

  if (descuento_monto && descuento_monto > 0) {
    total -= descuento_monto;
  } else if (descuento_porcentaje && descuento_porcentaje > 0) {
    const descuento = total * (descuento_porcentaje / 100);
    total -= descuento;
  }

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

const updateQuotationDetail = (req, res) => {
  const { id, detailId } = req.params;
  const { cantidad, precio_unitario, descuento_porcentaje, descuento_monto } =
    req.body;

  if (!cantidad || !precio_unitario) {
    return res.status(400).json({
      success: false,
      message: "Campos requeridos: cantidad, precio_unitario",
    });
  }

  let total = cantidad * precio_unitario;

  if (descuento_monto && descuento_monto > 0) {
    total -= descuento_monto;
  } else if (descuento_porcentaje && descuento_porcentaje > 0) {
    const descuento = total * (descuento_porcentaje / 100);
    total -= descuento;
  }

  total = Math.max(0, total);

  const sql = `
    UPDATE cotizacion_detalles 
    SET cantidad = ?, precio_unitario = ?, 
        descuento_porcentaje = ?, descuento_monto = ?, total = ?
    WHERE id_cot_det = ? AND idcotizacion = ?
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

      actualizarTotalesCotizacion(id);

      res.json({
        success: true,
        message: "Detalle actualizado correctamente",
        total: total,
      });
    }
  );
};

const deleteQuotationDetail = (req, res) => {
  const { id, detailId } = req.params;

  const sql =
    "DELETE FROM cotizacion_detalles WHERE id_cot_det = ? AND idcotizacion = ?";

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

    actualizarTotalesCotizacion(id);

    res.json({
      success: true,
      message: "Detalle eliminado correctamente",
    });
  });
};

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
      const iva = subtotal * 0.19;
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
  getQuotationDetails,
  addQuotationDetail,
  updateQuotationDetail,
  deleteQuotationDetail,
};
