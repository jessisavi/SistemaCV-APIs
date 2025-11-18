const db = require('../config/database');

// Obtener todas las categorías
const getAllCategories = (req, res) => {
    const sql = 'SELECT * FROM categorias ORDER BY nombre';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener categorías'
            });
        }
        
        res.json({
            success: true,
            categories: results
        });
    });
};

// Crear nueva categoría
const createCategory = (req, res) => {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
        return res.status(400).json({
            success: false,
            message: 'El nombre de la categoría es requerido'
        });
    }
    
    const sql = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';
    
    db.query(sql, [nombre, descripcion || null], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al crear categoría'
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada correctamente',
            categoryId: results.insertId
        });
    });
};

// Obtener categoría por ID
const getCategoryById = (req, res) => {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM categorias WHERE idcategoria = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener categoría'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.json({
            success: true,
            category: results[0]
        });
    });
};

// Actualizar categoría
const updateCategory = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
        return res.status(400).json({
            success: false,
            message: 'El nombre de la categoría es requerido'
        });
    }
    
    const sql = 'UPDATE categorias SET nombre = ?, descripcion = ? WHERE idcategoria = ?';
    
    db.query(sql, [nombre, descripcion || null, id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar categoría'
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría actualizada correctamente'
        });
    });
};

// Eliminar categoría
const deleteCategory = (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM categorias WHERE idcategoria = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar categoría'
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría eliminada correctamente'
        });
    });
};

module.exports = {
    getAllCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
};