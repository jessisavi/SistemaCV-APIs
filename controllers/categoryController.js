const db = require("../config/database");

// Obtener todas las categorías ordenadas por nombre
const getAllCategories = (req, res) => {
  const sql = "SELECT * FROM categorias ORDER BY nombre ASC";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener categorías",
      });
    }

    // Mapear los resultados para coincidir con la entidad Java
    const categories = results.map((row) => ({
      idCategoria: row.idcategoria,
      nombre: row.nombre,
      descripcion: row.descripcion,
      fechaCreacion: row.fecha_creacion,
    }));

    res.json({
      success: true,
      categories: categories,
    });
  });
};

// Buscar categoría por ID
const getCategoryById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM categorias WHERE idcategoria = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener categoría",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    const category = {
      idCategoria: results[0].idcategoria,
      nombre: results[0].nombre,
      descripcion: results[0].descripcion,
      fechaCreacion: results[0].fecha_creacion,
    };

    res.json({
      success: true,
      category: category,
    });
  });
};

// Buscar categoría por nombre (exacto)
const getCategoryByName = (req, res) => {
  const { nombre } = req.params;

  const sql = "SELECT * FROM categorias WHERE nombre = ?";

  db.query(sql, [nombre], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar categoría",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    const category = {
      idCategoria: results[0].idcategoria,
      nombre: results[0].nombre,
      descripcion: results[0].descripcion,
      fechaCreacion: results[0].fecha_creacion,
    };

    res.json({
      success: true,
      category: category,
    });
  });
};

// Crear nueva categoría
const createCategory = (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({
      success: false,
      message: "El nombre de la categoría es requerido",
    });
  }

  const sql =
    "INSERT INTO categorias (nombre, descripcion, fecha_creacion) VALUES (?, ?, NOW())";

  db.query(sql, [nombre, descripcion || null], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al crear categoría",
      });
    }

    res.status(201).json({
      success: true,
      message: "Categoría creada correctamente",
      categoryId: results.insertId,
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
      message: "El nombre de la categoría es requerido",
    });
  }

  const sql =
    "UPDATE categorias SET nombre = ?, descripcion = ? WHERE idcategoria = ?";

  db.query(sql, [nombre, descripcion || null, id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al actualizar categoría",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Categoría actualizada correctamente",
    });
  });
};

// Eliminar categoría
const deleteCategory = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM categorias WHERE idcategoria = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar categoría",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Categoría eliminada correctamente",
    });
  });
};

// Verificar si existe categoría por nombre
const categoryExists = (req, res) => {
  const { nombre } = req.params;

  const sql = "SELECT COUNT(*) as count FROM categorias WHERE nombre = ?";

  db.query(sql, [nombre], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al verificar categoría",
      });
    }

    res.json({
      success: true,
      exists: results[0].count > 0,
    });
  });
};

// Buscar categorías por nombre (parcial)
const searchCategoriesByName = (req, res) => {
  const { nombre } = req.params;

  const sql =
    "SELECT * FROM categorias WHERE nombre LIKE ? ORDER BY nombre ASC";

  db.query(sql, [`%${nombre}%`], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar categorías",
      });
    }

    const categories = results.map((row) => ({
      idCategoria: row.idcategoria,
      nombre: row.nombre,
      descripcion: row.descripcion,
      fechaCreacion: row.fecha_creacion,
    }));

    res.json({
      success: true,
      categories: categories,
    });
  });
};

// Obtener categorías con productos en stock
const getCategoriesWithStock = (req, res) => {
  const sql = `
        SELECT DISTINCT c.* 
        FROM categorias c 
        INNER JOIN productos p ON c.idcategoria = p.categoria_id 
        WHERE p.stock > 0 
        ORDER BY c.nombre ASC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener categorías con stock",
      });
    }

    const categories = results.map((row) => ({
      idCategoria: row.idcategoria,
      nombre: row.nombre,
      descripcion: row.descripcion,
      fechaCreacion: row.fecha_creacion,
    }));

    res.json({
      success: true,
      categories: categories,
    });
  });
};

// Contar productos por categoría
const countProductsByCategory = (req, res) => {
  const { id } = req.params;

  const sql =
    "SELECT COUNT(*) as productCount FROM productos WHERE categoria_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al contar productos",
      });
    }

    res.json({
      success: true,
      categoryId: parseInt(id),
      productCount: results[0].productCount,
    });
  });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryExists,
  searchCategoriesByName,
  getCategoriesWithStock,
  countProductsByCategory,
};
