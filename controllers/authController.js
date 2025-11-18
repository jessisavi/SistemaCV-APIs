const db = require('../config/database');

const login = (req, res) => {
    const { usuario, contraseña } = req.body;

    // Validar que vengan los datos
    if (!usuario || !contraseña) {
        return res.status(400).json({
            success: false,
            message: 'Usuario y contraseña son requeridos'
        });
    }

    // Consulta a la base de datos
    const sql = 'SELECT idempleado, usuario, rol FROM portalempleados WHERE usuario = ? AND contraseña = ?';
    
    db.query(sql, [usuario, contraseña], (err, results) => {
        if (err) {
            console.error('Error en consulta:', err);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }

        if (results.length > 0) {
            // Usuario autenticado correctamente
            const user = results[0];
            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user.idempleado,
                    usuario: user.usuario,
                    rol: user.rol
                }
            });
        } else {
            // Credenciales incorrectas
            res.status(401).json({
                success: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }
    });
};

const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
};

const getProfile = (req, res) => {
    const { id } = req.params;
    
    const sql = 'SELECT idempleado, usuario, rol FROM portalempleados WHERE idempleado = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }

        if (results.length > 0) {
            res.json({
                success: true,
                user: results[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
    });
};

module.exports = {
    login,
    logout,
    getProfile
};