const express = require('express');
const router = express.Router();
const {
    getAllClients,
    createClient,
    getClientById,
    updateClient,
    deleteClient,
    searchClients,
    getClientStats
} = require('../controllers/clientController');

// GET /api/clients
router.get('/', getAllClients);

// POST /api/clients
router.post('/', createClient);

// GET /api/clients/stats/summary
router.get('/stats/summary', getClientStats);

// GET /api/clients/search
router.get('/search', searchClients);

// GET /api/clients/:id
router.get('/:id', getClientById);

// PUT /api/clients/:id
router.put('/:id', updateClient);

// DELETE /api/clients/:id
router.delete('/:id', deleteClient);

module.exports = router;