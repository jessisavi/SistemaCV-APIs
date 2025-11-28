const db = require("../config/database");

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Usuario y contraseña son requeridos",
    });
  }

  // Consulta actualizada con JOIN para obtener el nombre del rol
  const sql = `
    SELECT p.idempleado as id, p.usuario as username, r.nombre as rol 
    FROM portalempleados p 
    INNER JOIN roles r ON p.rol_id = r.id_rol 
    WHERE p.usuario = ? AND p.contraseña = ?
  `;

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("Error en consulta:", err);
      return res.status(500).json({
        success: false,
        message: "Error del servidor",
      });
    }

    if (results.length > 0) {
      const user = results[0];

      req.session.user = user;
      req.session.rol = user.rol;

      res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        user: {
          id: user.id,
          username: user.username,
          rol: user.rol,
        },
        redirect: "/dashboard",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }
  });
};

const logout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al cerrar sesión",
        });
      }

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
        redirect: "/login?logout=true",
      });
    });
  } else {
    res.json({
      success: true,
      message: "Sesión cerrada exitosamente",
      redirect: "/login?logout=true",
    });
  }
};

const getProfile = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT p.idempleado as id, p.usuario as username, r.nombre as rol 
    FROM portalempleados p 
    INNER JOIN roles r ON p.rol_id = r.id_rol 
    WHERE p.idempleado = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error del servidor",
      });
    }

    if (results.length > 0) {
      res.json({
        success: true,
        user: results[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }
  });
};

const checkSession = (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      user: req.session.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "No hay sesión activa",
    });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  checkSession,
};
