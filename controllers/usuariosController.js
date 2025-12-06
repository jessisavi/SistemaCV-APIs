const db = require("../config/database");

// Obtener todos los usuarios
const getAllUsers = (req, res) => {
  const sql = `
        SELECT p.idempleado, p.usuario, r.nombre as rol 
        FROM portalempleados p 
        INNER JOIN roles r ON p.rol_id = r.id_rol
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener usuarios",
      });
    }

    res.json({
      success: true,
      users: results,
    });
  });
};

// Obtener usuario por ID
const getUserById = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT p.idempleado, p.usuario, r.nombre as rol 
        FROM portalempleados p 
        INNER JOIN roles r ON p.rol_id = r.id_rol 
        WHERE p.idempleado = ?
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener usuario",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      user: results[0],
    });
  });
};

// Actualizar usuario
const updateUser = (req, res) => {
  const { id } = req.params;
  const { usuario, rol } = req.body;

  if (!usuario || !rol) {
    return res.status(400).json({
      success: false,
      message: "Usuario y rol son requeridos",
    });
  }

  // Primero obtener el ID del rol por su nombre
  const getRoleIdSql = "SELECT id_rol FROM roles WHERE nombre = ?";

  db.query(getRoleIdSql, [rol], (err, roleResults) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar rol",
      });
    }

    if (roleResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rol no encontrado",
      });
    }

    const rol_id = roleResults[0].id_rol;

    const updateSql =
      "UPDATE portalempleados SET usuario = ?, rol_id = ? WHERE idempleado = ?";

    db.query(updateSql, [usuario, rol_id, id], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar usuario",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuario actualizado correctamente",
      });
    });
  });
};

// Obtener permisos de usuario
const getUserPermissions = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT rp.permiso 
        FROM portalempleados p 
        INNER JOIN roles r ON p.rol_id = r.id_rol 
        INNER JOIN rol_permisos rp ON r.id_rol = rp.id_rol 
        WHERE p.idempleado = ?
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener permisos",
      });
    }

    const permissions = results.map((row) => row.permiso);

    res.json({
      success: true,
      permissions: permissions,
    });
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  getUserPermissions,
};
