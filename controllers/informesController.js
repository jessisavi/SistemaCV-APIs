const db = require("../config/database");

const getSalesReport = (req, res) => {
  const { startDate, endDate } = req.query;

  let sql = `
        SELECT 
            v.idventa,
            v.numero_factura,
            v.fecha,
            v.total,
            v.estado,
            v.metodo_pago,
            CONCAT(c.nombre, ' ', c.apellido) as cliente,
            u.usuario as vendedor,
            COUNT(vd.id) as cantidad_productos,
            SUM(vd.cantidad) as total_unidades
        FROM ventas v
        LEFT JOIN clientes c ON v.idcliente = c.idcliente
        LEFT JOIN portalempleados u ON v.idempleado = u.idempleado
        LEFT JOIN venta_detalles vd ON v.idventa = vd.idventa
    `;

  const params = [];

  if (startDate && endDate) {
    sql += ` WHERE v.fecha BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  sql += ` GROUP BY v.idventa, v.numero_factura, v.fecha, v.total, v.estado, 
                     v.metodo_pago, c.nombre, c.apellido, u.usuario
             ORDER BY v.fecha DESC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error al obtener reporte de ventas:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener reporte de ventas",
      });
    }

    getSalesStats(startDate, endDate, (err, stats) => {
      if (err) {
        console.error("Error al obtener estadísticas:", err);
        stats = {};
      }

      res.json({
        success: true,
        report: {
          sales: results,
          statistics: stats,
          period: {
            startDate: startDate || "No especificado",
            endDate: endDate || "No especificado",
          },
        },
      });
    });
  });
};

const getSalesStats = (startDate, endDate, callback) => {
  let sql = `
        SELECT 
            COUNT(*) as total_ventas,
            COALESCE(SUM(total), 0) as total_ingresos,
            COALESCE(AVG(total), 0) as promedio_venta,
            COALESCE(MAX(total), 0) as venta_maxima,
            COALESCE(MIN(total), 0) as venta_minima,
            SUM(CASE WHEN estado = 'COMPLETADA' THEN 1 ELSE 0 END) as completadas,
            SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN estado = 'CANCELADA' THEN 1 ELSE 0 END) as canceladas
        FROM ventas
    `;

  const params = [];

  if (startDate && endDate) {
    sql += ` WHERE fecha BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || {});
  });
};

const getQuotationsReport = (req, res) => {
  const { startDate, endDate } = req.query;

  let sql = `
        SELECT 
            c.idcotizacion,
            CONCAT('COT-', c.idcotizacion) as numero_cotizacion,
            c.fecha_creacion as fecha,
            c.valido_hasta,
            c.total,
            c.estado,
            CONCAT(cli.nombre, ' ', cli.apellido) as cliente,
            u.usuario as vendedor,
            COUNT(cd.id_cot_det) as cantidad_productos,
            DATEDIFF(c.valido_hasta, CURDATE()) as dias_para_vencer
        FROM cotizaciones c
        LEFT JOIN clientes cli ON c.idcliente = cli.idcliente
        LEFT JOIN portalempleados u ON c.idempleado = u.idempleado
        LEFT JOIN cotizacion_detalles cd ON c.idcotizacion = cd.idcotizacion
    `;

  const params = [];

  if (startDate && endDate) {
    sql += ` WHERE c.fecha_creacion BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  sql += ` GROUP BY c.idcotizacion, c.fecha_creacion, c.valido_hasta, c.total, c.estado, 
                     cli.nombre, cli.apellido, u.usuario
             ORDER BY c.fecha_creacion DESC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error al obtener reporte de cotizaciones:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener reporte de cotizaciones",
      });
    }

    getQuotationsStats(startDate, endDate, (err, stats) => {
      if (err) {
        console.error("Error al obtener estadísticas:", err);
        stats = {};
      }

      res.json({
        success: true,
        report: {
          quotations: results,
          statistics: stats,
          period: {
            startDate: startDate || "No especificado",
            endDate: endDate || "No especificado",
          },
        },
      });
    });
  });
};

const getQuotationsStats = (startDate, endDate, callback) => {
  let sql = `
        SELECT 
            COUNT(*) as total_cotizaciones,
            COALESCE(SUM(total), 0) as total_valor,
            COALESCE(AVG(total), 0) as promedio_cotizacion,
            SUM(CASE WHEN estado = 'APROBADA' THEN 1 ELSE 0 END) as aprobadas,
            SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN estado = 'RECHAZADA' THEN 1 ELSE 0 END) as rechazadas,
            SUM(CASE WHEN estado = 'VENCIDA' THEN 1 ELSE 0 END) as vencidas
        FROM cotizaciones
    `;

  const params = [];

  if (startDate && endDate) {
    sql += ` WHERE fecha_creacion BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || {});
  });
};

const getMostSoldProducts = (req, res) => {
  const { limit = 10 } = req.query;

  const sql = `
        SELECT 
            p.idproducto,
            p.codigo,
            p.nombre,
            cat.nombre as categoria,
            COALESCE(SUM(vd.cantidad), 0) as total_vendido,
            COALESCE(SUM(vd.cantidad * vd.precio_unitario), 0) as total_ingresos,
            COALESCE(AVG(vd.precio_unitario), 0) as precio_promedio
        FROM productos p
        LEFT JOIN categorias cat ON p.categoria_id = cat.idcategoria
        LEFT JOIN venta_detalles vd ON p.idproducto = vd.idproducto
        LEFT JOIN ventas v ON vd.idventa = v.idventa AND v.estado = 'COMPLETADA'
        GROUP BY p.idproducto, p.codigo, p.nombre, cat.nombre
        ORDER BY total_vendido DESC
        LIMIT ?
    `;

  db.query(sql, [parseInt(limit)], (err, results) => {
    if (err) {
      console.error("Error al obtener productos más vendidos:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos más vendidos",
      });
    }

    res.json({
      success: true,
      products: results,
    });
  });
};

const getClientsSummary = (req, res) => {
  const sql = `
        SELECT 
            c.idcliente,
            CONCAT(c.nombre, ' ', c.apellido) as cliente,
            c.correo_electronico,
            c.celular,
            c.ciudad,
            COUNT(DISTINCT v.idventa) as total_compras,
            COALESCE(SUM(v.total), 0) as total_gastado,
            MAX(v.fecha) as ultima_compra,
            COUNT(DISTINCT cot.idcotizacion) as total_cotizaciones
        FROM clientes c
        LEFT JOIN ventas v ON c.idcliente = v.idcliente AND v.estado = 'COMPLETADA'
        LEFT JOIN cotizaciones cot ON c.idcliente = cot.idcliente
        GROUP BY c.idcliente, c.nombre, c.apellido, c.correo_electronico, c.celular, c.ciudad
        ORDER BY total_gastado DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener resumen de clientes:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener resumen de clientes",
      });
    }

    const statsSql = `
            SELECT 
                COUNT(*) as total_clientes,
                COUNT(DISTINCT v.idcliente) as clientes_con_compras,
                COUNT(DISTINCT cot.idcliente) as clientes_con_cotizaciones,
                COALESCE(AVG(compras_por_cliente), 0) as promedio_compras_por_cliente
            FROM clientes c
            LEFT JOIN (
                SELECT idcliente, COUNT(*) as compras_por_cliente 
                FROM ventas 
                WHERE estado = 'COMPLETADA' 
                GROUP BY idcliente
            ) v ON c.idcliente = v.idcliente
            LEFT JOIN (
                SELECT idcliente, COUNT(*) as cotizaciones_por_cliente 
                FROM cotizaciones 
                GROUP BY idcliente
            ) cot ON c.idcliente = cot.idcliente
        `;

    db.query(statsSql, (err, statsResults) => {
      if (err) {
        console.error("Error al obtener estadísticas de clientes:", err);
        statsResults = [{}];
      }

      res.json({
        success: true,
        clients: results,
        statistics: statsResults[0] || {},
      });
    });
  });
};

const getDashboardSummary = (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const sql = `
        SELECT 
            (SELECT COALESCE(SUM(total), 0) FROM ventas 
             WHERE DATE(fecha) = ? AND estado = 'COMPLETADA') as ventas_hoy,
            
            (SELECT COALESCE(SUM(total), 0) FROM ventas 
             WHERE fecha >= ? AND estado = 'COMPLETADA') as ventas_mes,
            
            (SELECT COALESCE(SUM(total), 0) FROM ventas 
             WHERE YEAR(fecha) = YEAR(CURDATE()) AND estado = 'COMPLETADA') as ventas_anio,
            
            (SELECT COUNT(*) FROM ventas WHERE estado = 'COMPLETADA') as total_ventas,
            
            (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'PENDIENTE') as cotizaciones_pendientes,
            
            (SELECT COUNT(*) FROM ventas WHERE estado = 'PENDIENTE') as ventas_pendientes,
            
            (SELECT COUNT(*) FROM clientes) as total_clientes,
            
            (SELECT COUNT(*) FROM productos) as total_productos,
            
            (SELECT COUNT(*) FROM productos WHERE stock < 10) as productos_stock_bajo
    `;

  db.query(sql, [today, firstDayOfMonth], (err, results) => {
    if (err) {
      console.error("Error al obtener resumen del dashboard:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener resumen del dashboard",
      });
    }

    const summary = results[0] || {};

    const productsSql = `
            SELECT p.nombre, SUM(vd.cantidad) as cantidad_vendida
            FROM productos p
            JOIN venta_detalles vd ON p.idproducto = vd.idproducto
            JOIN ventas v ON vd.idventa = v.idventa AND v.estado = 'COMPLETADA'
            WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY p.idproducto, p.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 5
        `;

    db.query(productsSql, (err, productsResults) => {
      if (err) {
        console.error("Error al obtener productos recientes:", err);
        productsResults = [];
      }

      res.json({
        success: true,
        summary: {
          ...summary,
          topProducts: productsResults,
        },
      });
    });
  });
};

const generateReport = (req, res) => {
  const {
    reportType,
    startDate,
    endDate,
    filters = {},
    format = "json",
  } = req.body;

  if (!reportType) {
    return res.status(400).json({
      success: false,
      message: "El tipo de reporte es requerido",
    });
  }

  const logSql = `
        INSERT INTO informe_logs (tipo_informe, fecha_inicio, fecha_fin, parametros)
        VALUES (?, ?, ?, ?)
    `;

  const paramsJson = JSON.stringify({
    filters,
    format,
    generatedAt: new Date().toISOString(),
  });

  db.query(
    logSql,
    [reportType, startDate || null, endDate || null, paramsJson],
    (err, result) => {
      if (err) {
        console.error("Error al registrar log de reporte:", err);
      }

      res.json({
        success: true,
        message: "Reporte generado exitosamente",
        reportId: result ? result.insertId : null,
        reportType,
        period: {
          startDate: startDate || "No especificado",
          endDate: endDate || "No especificado",
        },
        filters,
        format,
        downloadUrl:
          format !== "json"
            ? `/api/reports/download/${result ? result.insertId : "temp"}`
            : null,
      });
    }
  );
};

const getReportHistory = (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const sql = `
        SELECT 
            id_informe_log as id,
            tipo_informe as reportType,
            fecha_inicio as startDate,
            fecha_fin as endDate,
            parametros as parameters,
            fecha_generacion as createdAt,
            idempleado as employeeId,
            estado as status,
            mensaje_error as errorMessage,
            nombre_archivo as fileName,
            tamano_archivo as fileSize
        FROM informe_logs 
        ORDER BY fecha_generacion DESC 
        LIMIT ? OFFSET ?
    `;

  db.query(sql, [parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      console.error("Error al obtener historial de reportes:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener historial de reportes: " + err.message,
      });
    }

    const reports = results.map((report) => {
      if (report.parameters) {
        try {
          report.parameters = JSON.parse(report.parameters);
        } catch (e) {
          report.parameters = { descripcion: report.parameters };
        }
      } else {
        report.parameters = {};
      }
      return report;
    });

    const countSql = `SELECT COUNT(*) as total FROM informe_logs`;

    db.query(countSql, (err, countResults) => {
      if (err) {
        console.error("Error al contar reportes:", err);
        return res.json({
          success: true,
          reports,
          pagination: {
            total: reports.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: reports.length === parseInt(limit),
          },
        });
      }

      res.json({
        success: true,
        reports,
        pagination: {
          total: countResults[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + reports.length < countResults[0].total,
        },
      });
    });
  });
};

module.exports = {
  getSalesReport,
  getQuotationsReport,
  getMostSoldProducts,
  getClientsSummary,
  getDashboardSummary,
  generateReport,
  getReportHistory,
};
