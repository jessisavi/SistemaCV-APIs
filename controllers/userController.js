const db = require('../config/database');

// Obtener todos los usuarios
const getAllUsers = (req, res) => {
    const sql = 'SELECT idempleado, usuario, rol FROM portalempleados';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios'
            });
        }
        
        res.json({
            success: true,
            users: results
        });
    });
};

// Obtener usuario por ID
const getUserById = (req, res) => {
    const { id } = req.params;
    
    const sql = 'SELECT idempleado, usuario, rol FROM portalempleados WHERE idempleado = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener usuario'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            user: results[0]
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
            message: 'Usuario y rol son requeridos'
        });
    }
    
    const sql = 'UPDATE portalempleados SET usuario = ?, rol = ? WHERE idempleado = ?';
    
    db.query(sql, [usuario, rol, id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario'
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Usuario actualizado correctamente'
        });
    });
};

// Obtener permisos de usuario (simplificado)
const getUserPermissions = (req, res) => {
    const { id } = req.params;
    
    // Consulta simplificada - en una versión real usarías la tabla rol_permisos
    const sql = `
        SELECT p.rol, rp.permiso 
        FROM portalempleados p 
        LEFT JOIN rol_permisos rp ON p.rol = rp.rol_id 
        WHERE p.idempleado = ?
    `;
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener permisos'
            });
        }
        
        const permissions = results.map(row => row.permiso).filter(Boolean);
        
        res.json({
            success: true,
            permissions: permissions
        });
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    getUserPermissions
};