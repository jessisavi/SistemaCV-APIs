const db = require("../config/database");

// Obtener todos los clientes
const getAllClients = (req, res) => {
  const sql = `
        SELECT 
            idcliente as idCliente,
            idempleado as idEmpleado,
            fecha_registro as fechaRegistro,
            nombre,
            apellido,
            tipo_documento as tipoDocumento,
            numero_documento as numeroDocumento,
            direccion,
            ciudad,
            celular,
            correo_electronico as correoElectronico,
            tipo_cliente as tipoCliente,
            estado
        FROM clientes 
        ORDER BY nombre, apellido
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener clientes",
      });
    }

    res.json({
      success: true,
      data: results,
    });
  });
};

// Crear nuevo cliente
const createClient = (req, res) => {
  const {
    nombre,
    apellido,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudad,
    celular,
    correoElectronico,
    tipoCliente,
    estado,
    idEmpleado,
  } = req.body;

  if (!nombre || !apellido) {
    return res.status(400).json({
      success: false,
      message: "Nombre y apellido son requeridos",
    });
  }

  const estadoFinal = estado || "Activo";
  const tipoClienteFinal = tipoCliente || "Regular";

  const sql = `
        INSERT INTO clientes 
        (nombre, apellido, tipo_documento, numero_documento, direccion, ciudad, 
         celular, correo_electronico, tipo_cliente, fecha_registro, estado, idempleado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
    `;

  db.query(
    sql,
    [
      nombre,
      apellido,
      tipoDocumento || null,
      numeroDocumento || null,
      direccion || null,
      ciudad || null,
      celular || null,
      correoElectronico || null,
      tipoClienteFinal,
      estadoFinal,
      idEmpleado || null,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al crear cliente: " + err.message,
        });
      }

      const getSql = `
            SELECT 
                idcliente as idCliente,
                idempleado as idEmpleado,
                fecha_registro as fechaRegistro,
                nombre,
                apellido,
                tipo_documento as tipoDocumento,
                numero_documento as numeroDocumento,
                direccion,
                ciudad,
                celular,
                correo_electronico as correoElectronico,
                tipo_cliente as tipoCliente,
                estado
            FROM clientes 
            WHERE idcliente = ?
        `;

      db.query(getSql, [results.insertId], (err, clientResults) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Cliente creado pero error al obtener datos",
          });
        }

        res.status(201).json({
          success: true,
          message: "Cliente creado correctamente",
          data: clientResults[0],
        });
      });
    }
  );
};

// Obtener cliente por ID
const getClientById = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT 
            idcliente as idCliente,
            idempleado as idEmpleado,
            fecha_registro as fechaRegistro,
            nombre,
            apellido,
            tipo_documento as tipoDocumento,
            numero_documento as numeroDocumento,
            direccion,
            ciudad,
            celular,
            correo_electronico as correoElectronico,
            tipo_cliente as tipoCliente,
            estado
        FROM clientes 
        WHERE idcliente = ?
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener cliente",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    res.json({
      success: true,
      data: results[0],
    });
  });
};

// Actualizar cliente
const updateClient = (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudad,
    celular,
    correoElectronico,
    tipoCliente,
    estado,
    idEmpleado,
  } = req.body;

  if (!nombre || !apellido) {
    return res.status(400).json({
      success: false,
      message: "Nombre y apellido son requeridos",
    });
  }

  const sql = `
        UPDATE clientes 
        SET nombre = ?, apellido = ?, tipo_documento = ?, numero_documento = ?, 
            direccion = ?, ciudad = ?, celular = ?, correo_electronico = ?, 
            tipo_cliente = ?, estado = ?, idempleado = ?
        WHERE idcliente = ?
    `;

  db.query(
    sql,
    [
      nombre,
      apellido,
      tipoDocumento || null,
      numeroDocumento || null,
      direccion || null,
      ciudad || null,
      celular || null,
      correoElectronico || null,
      tipoCliente || "Regular",
      estado || "Activo",
      idEmpleado || null,
      id,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar cliente: " + err.message,
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      const getSql = `
            SELECT 
                idcliente as idCliente,
                idempleado as idEmpleado,
                fecha_registro as fechaRegistro,
                nombre,
                apellido,
                tipo_documento as tipoDocumento,
                numero_documento as numeroDocumento,
                direccion,
                ciudad,
                celular,
                correo_electronico as correoElectronico,
                tipo_cliente as tipoCliente,
                estado
            FROM clientes 
            WHERE idcliente = ?
        `;

      db.query(getSql, [id], (err, clientResults) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Cliente actualizado pero error al obtener datos",
          });
        }

        res.json({
          success: true,
          message: "Cliente actualizado correctamente",
          data: clientResults[0],
        });
      });
    }
  );
};

// Eliminar cliente
const deleteClient = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM clientes WHERE idcliente = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar cliente: " + err.message,
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Cliente eliminado correctamente",
    });
  });
};

// Buscar clientes
const searchClients = (req, res) => {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({
      success: false,
      message: "Término de búsqueda requerido",
    });
  }

  const sql = `
        SELECT 
            idcliente as idCliente,
            idempleado as idEmpleado,
            fecha_registro as fechaRegistro,
            nombre,
            apellido,
            tipo_documento as tipoDocumento,
            numero_documento as numeroDocumento,
            direccion,
            ciudad,
            celular,
            correo_electronico as correoElectronico,
            tipo_cliente as tipoCliente,
            estado
        FROM clientes 
        WHERE nombre LIKE ? OR apellido LIKE ? OR correo_electronico LIKE ? OR numero_documento LIKE ?
        ORDER BY nombre, apellido
    `;

  const searchTerm = `%${term}%`;

  db.query(
    sql,
    [searchTerm, searchTerm, searchTerm, searchTerm],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al buscar clientes",
        });
      }

      res.json({
        success: true,
        data: results,
      });
    }
  );
};

// Estadísticas de clientes
const getClientStats = (req, res) => {
  const sql = `
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN estado = 'Activo' THEN 1 END) as activos,
            COUNT(CASE WHEN estado = 'Inactivo' THEN 1 END) as inactivos,
            COUNT(CASE WHEN tipo_cliente = 'Premium' THEN 1 END) as premium,
            COUNT(CASE WHEN tipo_cliente = 'Regular' THEN 1 END) as regular,
            COUNT(CASE WHEN fecha_registro = CURDATE() THEN 1 END) as nuevosHoy,
            ciudad
        FROM clientes 
        GROUP BY ciudad
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas",
      });
    }

    const total = results.reduce((sum, row) => sum + parseInt(row.total), 0);
    const activos = results.reduce(
      (sum, row) => sum + parseInt(row.activos),
      0
    );
    const inactivos = results.reduce(
      (sum, row) => sum + parseInt(row.inactivos),
      0
    );
    const premium = results.reduce(
      (sum, row) => sum + parseInt(row.premium),
      0
    );
    const regular = results.reduce(
      (sum, row) => sum + parseInt(row.regular),
      0
    );
    const nuevosHoy = results.reduce(
      (sum, row) => sum + parseInt(row.nuevosHoy),
      0
    );

    res.json({
      success: true,
      data: {
        totalClientes: total,
        clientesActivos: activos,
        clientesInactivos: inactivos,
        clientesPremium: premium,
        clientesRegular: regular,
        nuevosClientesHoy: nuevosHoy,
        porCiudad: results,
      },
    });
  });
};

module.exports = {
  getAllClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats,
};
