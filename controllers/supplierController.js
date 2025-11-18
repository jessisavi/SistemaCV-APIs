const db = require('../config/database');

// Obtener todos los proveedores
const getAllSuppliers = (req, res) => {
    const sql = 'SELECT * FROM proveedores ORDER BY nombre';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener proveedores'
            });
        }
        
        res.json({
            success: true,
            suppliers: results
        });
    });
};

// Crear nuevo proveedor
const createSupplier = (req, res) => {
    const { nombre, contacto, telefono, email, notas } = req.body;
    
    if (!nombre) {
        return res.status(400).json({
            success: false,
            message: 'El nombre del proveedor es requerido'
        });
    }
    
    const sql = 'INSERT INTO proveedores (nombre, contacto, telefono, email, notas) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [
        nombre, 
        contacto || null, 
        telefono || null, 
        email || null, 
        notas || null
    ], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al crear proveedor'
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Proveedor creado correctamente',
            supplierId: results.insertId
        });
    });
};

// Obtener proveedor por ID
const getSupplierById = (req, res) => {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM proveedores WHERE idproveedor = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener proveedor'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }
        
        res.json({
            success: true,
            supplier: results[0]
        });
    });
};

// Actualizar proveedor
const updateSupplier = (req, res) => {
    const { id } = req.params;
    const { nombre, contacto, telefono, email, notas } = req.body;
    
    if (!nombre) {
        return res.status(400).json({
            success: false,
            message: 'El nombre del proveedor es requerido'
        });
    }
    
    const sql = 'UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, email = ?, notas = ? WHERE idproveedor = ?';
    
    db.query(sql, [
        nombre, 
        contacto || null, 
        telefono || null, 
        email || null, 
        notas || null,
        id
    ], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar proveedor'
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Proveedor actualizado correctamente'
        });
    });
};

// Eliminar proveedor
const deleteSupplier = (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM proveedores WHERE idproveedor = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar proveedor'
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Proveedor eliminado correctamente'
        });
    });
};

module.exports = {
    getAllSuppliers,
    createSupplier,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};