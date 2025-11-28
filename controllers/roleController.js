const db = require("../config/database");

// Obtener todos los roles
const getAllRoles = (req, res) => {
  const sql =
    "SELECT id_rol as id, nombre, descripcion FROM roles WHERE activo = 1";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener roles",
      });
    }

    res.json({
      success: true,
      roles: results,
    });
  });
};

// Crear nuevo rol
const createRole = (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({
      success: false,
      message: "El nombre del rol es requerido",
    });
  }

  const sql = "INSERT INTO roles (nombre, descripcion) VALUES (?, ?)";

  db.query(sql, [nombre, descripcion || ""], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al crear rol",
      });
    }

    res.status(201).json({
      success: true,
      message: "Rol creado correctamente",
      roleId: results.insertId,
    });
  });
};

// Obtener rol por ID
const getRoleById = (req, res) => {
  const { id } = req.params;

  const sql =
    "SELECT id_rol as id, nombre, descripcion FROM roles WHERE id_rol = ? AND activo = 1";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener rol",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      });
    }

    res.json({
      success: true,
      role: results[0],
    });
  });
};

// Actualizar rol
const updateRole = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({
      success: false,
      message: "El nombre del rol es requerido",
    });
  }

  const sql = "UPDATE roles SET nombre = ?, descripcion = ? WHERE id_rol = ?";

  db.query(sql, [nombre, descripcion || "", id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al actualizar rol",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Rol actualizado correctamente",
    });
  });
};

// Eliminar rol (eliminación lógica)
const deleteRole = (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE roles SET activo = 0 WHERE id_rol = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar rol",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Rol eliminado correctamente",
    });
  });
};

module.exports = {
  getAllRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
};
