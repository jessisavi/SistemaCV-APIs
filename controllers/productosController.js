const db = require("../config/database");

// Obtener todos los productos
const getAllProducts = (req, res) => {
  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        ORDER BY p.nombre ASC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos",
      });
    }

    const products = results.map((row) => ({
      idproducto: row.idproducto,
      codigo: row.codigo,
      nombre: row.nombre,
      descripcion: row.descripcion,
      color: row.color,
      categoria_id: row.categoria_id,
      categoria_nombre: row.categoria_nombre,
      precio: row.precio,
      MT: row.MT,
      stock: row.stock,
      ubicacion: row.ubicacion,
      proveedor_id: row.proveedor_id,
      acabado: row.acabado,
      trafico: row.trafico,
      rectificado: row.rectificado,
      imagen: row.imagen,
      fecha_creacion: row.fecha_creacion,
      fecha_actualizacion: row.fecha_actualizacion,
    }));

    res.json({
      success: true,
      products: products,
    });
  });
};

// Crear nuevo producto
const createProduct = (req, res) => {
  const {
    codigo,
    nombre,
    descripcion,
    color,
    categoria_id,
    precio,
    MT,
    stock,
    ubicacion,
    proveedor_id,
    acabado,
    trafico,
    rectificado,
    imagen,
  } = req.body;

  if (!codigo || !nombre || !precio || !categoria_id) {
    return res.status(400).json({
      success: false,
      message: "Código, nombre, precio y categoría son requeridos",
    });
  }

  const sql = `
        INSERT INTO productos 
        (codigo, nombre, descripcion, color, categoria_id, precio, MT, stock, ubicacion, proveedor_id, acabado, trafico, rectificado, imagen, fecha_creacion, fecha_actualizacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

  db.query(
    sql,
    [
      codigo,
      nombre,
      descripcion || null,
      color || null,
      categoria_id,
      precio,
      MT || "M2",
      stock || 0,
      ubicacion || null,
      proveedor_id || null,
      acabado || null,
      trafico || null,
      rectificado || "0",
      imagen || null,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al crear producto: " + err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Producto creado correctamente",
        productId: results.insertId,
      });
    }
  );
};

// Obtener producto por ID
const getProductById = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        WHERE p.idproducto = ?
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener producto",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      product: results[0],
    });
  });
};

// Actualizar producto
const updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    codigo,
    nombre,
    descripcion,
    color,
    categoria_id,
    precio,
    MT,
    stock,
    ubicacion,
    proveedor_id,
    acabado,
    trafico,
    rectificado,
    imagen,
  } = req.body;

  if (!codigo || !nombre || !precio || !categoria_id) {
    return res.status(400).json({
      success: false,
      message: "Código, nombre, precio y categoría son requeridos",
    });
  }

  const sql = `
        UPDATE productos 
        SET codigo = ?, nombre = ?, descripcion = ?, color = ?, 
            categoria_id = ?, precio = ?, MT = ?, stock = ?, ubicacion = ?,
            proveedor_id = ?, acabado = ?, trafico = ?, rectificado = ?, imagen = ?,
            fecha_actualizacion = NOW()
        WHERE idproducto = ?
    `;

  db.query(
    sql,
    [
      codigo,
      nombre,
      descripcion || null,
      color || null,
      categoria_id,
      precio,
      MT || "M2",
      stock || 0,
      ubicacion || null,
      proveedor_id || null,
      acabado || null,
      trafico || null,
      rectificado || "0",
      imagen || null,
      id,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar producto: " + err.message,
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Producto actualizado correctamente",
      });
    }
  );
};

// Eliminar producto
const deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM productos WHERE idproducto = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar producto",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  });
};

// Buscar productos
const searchProducts = (req, res) => {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({
      success: false,
      message: "Término de búsqueda requerido",
    });
  }

  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        WHERE p.nombre LIKE ? OR p.codigo LIKE ? OR p.descripcion LIKE ?
        ORDER BY p.nombre ASC
    `;

  const searchTerm = `%${term}%`;

  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar productos",
      });
    }

    res.json({
      success: true,
      products: results,
    });
  });
};

// Productos por categoría
const getProductsByCategory = (req, res) => {
  const { categoryId } = req.params;

  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        WHERE p.categoria_id = ?
        ORDER BY p.nombre ASC
    `;

  db.query(sql, [categoryId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos por categoría",
      });
    }

    res.json({
      success: true,
      products: results,
    });
  });
};

// Productos con stock bajo
const getLowStockProducts = (req, res) => {
  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        WHERE p.stock < 10 AND p.stock > 0
        ORDER BY p.stock ASC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos con stock bajo",
      });
    }

    res.json({
      success: true,
      products: results,
    });
  });
};

// Productos con stock crítico
const getCriticalStockProducts = (req, res) => {
  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        WHERE p.stock < 5 AND p.stock > 0
        ORDER BY p.stock ASC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos con stock crítico",
      });
    }

    res.json({
      success: true,
      products: results,
    });
  });
};

// Productos sin stock
const getOutOfStockProducts = (req, res) => {
  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        WHERE p.stock = 0
        ORDER BY p.nombre ASC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos sin stock",
      });
    }

    res.json({
      success: true,
      products: results,
    });
  });
};

// Obtener producto por código
const getProductByCode = (req, res) => {
  const { code } = req.params;

  const sql = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.idcategoria 
        WHERE p.codigo = ?
    `;

  db.query(sql, [code], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener producto",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      product: results[0],
    });
  });
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getLowStockProducts,
  getCriticalStockProducts,
  getOutOfStockProducts,
  getProductByCode,
};
