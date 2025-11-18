const db = require('../config/database');

// Obtener todos los clientes
const getAllClients = (req, res) => {
    const sql = `
        SELECT idcliente, nombre, apellido, tipo_documento, numero_documento, 
               direccion, ciudad, celular, correo_electronico, tipo_cliente, fecha_registro
        FROM clientes 
        ORDER BY nombre, apellido
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener clientes'
            });
        }
        
        res.json({
            success: true,
            clients: results
        });
    });
};

// Crear nuevo cliente
const createClient = (req, res) => {
    const { 
        nombre, 
        apellido, 
        tipo_documento, 
        numero_documento, 
        direccion, 
        ciudad, 
        celular, 
        correo_electronico, 
        tipo_cliente 
    } = req.body;
    
    if (!nombre || !apellido) {
        return res.status(400).json({
            success: false,
            message: 'Nombre y apellido son requeridos'
        });
    }
    
    const sql = `
        INSERT INTO clientes 
        (nombre, apellido, tipo_documento, numero_documento, direccion, ciudad, celular, correo_electronico, tipo_cliente, fecha_registro) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
    `;
    
    db.query(sql, [
        nombre, 
        apellido, 
        tipo_documento || null, 
        numero_documento || null, 
        direccion || null, 
        ciudad || null, 
        celular || null, 
        correo_electronico || null, 
        tipo_cliente || 'Regular'
    ], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al crear cliente'
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Cliente creado correctamente',
            clientId: results.insertId
        });
    });
};

// Obtener cliente por ID
const getClientById = (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT idcliente, nombre, apellido, tipo_documento, numero_documento, 
               direccion, ciudad, celular, correo_electronico, tipo_cliente, fecha_registro
        FROM clientes 
        WHERE idcliente = ?
    `;
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener cliente'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        res.json({
            success: true,
            client: results[0]
        });
    });
};

// Actualizar cliente
const updateClient = (req, res) => {
    const { id } = req.params;
    const { 
        nombre, 
        apellido, 
        tipo_documento, 
        numero_documento, 
        direccion, 
        ciudad, 
        celular, 
        correo_electronico, 
        tipo_cliente 
    } = req.body;
    
    if (!nombre || !apellido) {
        return res.status(400).json({
            success: false,
            message: 'Nombre y apellido son requeridos'
        });
    }
    
    const sql = `
        UPDATE clientes 
        SET nombre = ?, apellido = ?, tipo_documento = ?, numero_documento = ?, 
            direccion = ?, ciudad = ?, celular = ?, correo_electronico = ?, tipo_cliente = ?
        WHERE idcliente = ?
    `;
    
    db.query(sql, [
        nombre, 
        apellido, 
        tipo_documento || null, 
        numero_documento || null, 
        direccion || null, 
        ciudad || null, 
        celular || null, 
        correo_electronico || null, 
        tipo_cliente || 'Regular',
        id
    ], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar cliente'
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente actualizado correctamente'
        });
    });
};

// Eliminar cliente
const deleteClient = (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM clientes WHERE idcliente = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar cliente'
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente eliminado correctamente'
        });
    });
};

// Buscar clientes
const searchClients = (req, res) => {
    const { term } = req.query;
    
    if (!term) {
        return res.status(400).json({
            success: false,
            message: 'Término de búsqueda requerido'
        });
    }
    
    const sql = `
        SELECT idcliente, nombre, apellido, tipo_documento, numero_documento, 
               direccion, ciudad, celular, correo_electronico, tipo_cliente, fecha_registro
        FROM clientes 
        WHERE nombre LIKE ? OR apellido LIKE ? OR correo_electronico LIKE ?
        ORDER BY nombre, apellido
    `;
    
    const searchTerm = `%${term}%`;
    
    db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al buscar clientes'
            });
        }
        
        res.json({
            success: true,
            clients: results
        });
    });
};

// Estadísticas de clientes
const getClientStats = (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_clientes,
            COUNT(CASE WHEN tipo_cliente = 'Premium' THEN 1 END) as clientes_premium,
            COUNT(CASE WHEN tipo_cliente = 'Regular' THEN 1 END) as clientes_regular,
            ciudad
        FROM clientes 
        GROUP BY ciudad
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
        
        const total = results.reduce((sum, row) => sum + parseInt(row.total_clientes), 0);
        const premium = results.reduce((sum, row) => sum + parseInt(row.clientes_premium), 0);
        const regular = results.reduce((sum, row) => sum + parseInt(row.clientes_regular), 0);
        
        res.json({
            success: true,
            stats: {
                total,
                premium,
                regular,
                byCity: results
            }
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
    getClientStats
};