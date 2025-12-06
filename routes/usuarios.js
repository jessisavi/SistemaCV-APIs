const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    getUserPermissions
} = require('../controllers/usuariosController');

// GET /api/users
router.get('/', getAllUsers);

// GET /api/users/:id
router.get('/:id', getUserById);

// PUT /api/users/:id
router.put('/:id', updateUser);

// GET /api/users/:id/permissions
router.get('/:id/permissions', getUserPermissions);

module.exports = router;