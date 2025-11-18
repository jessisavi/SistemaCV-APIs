const express = require('express');
const router = express.Router();
const {
    getAllRoles,
    createRole,
    getRoleById,
    updateRole,
    deleteRole
} = require('../controllers/roleController');

// GET /api/roles
router.get('/', getAllRoles);

// POST /api/roles
router.post('/', createRole);

// GET /api/roles/:id
router.get('/:id', getRoleById);

// PUT /api/roles/:id
router.put('/:id', updateRole);

// DELETE /api/roles/:id
router.delete('/:id', deleteRole);

module.exports = router;