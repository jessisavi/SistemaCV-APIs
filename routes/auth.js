const express = require('express');
const router = express.Router();
const { login, logout, getProfile } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me/:id
router.get('/me/:id', getProfile);

module.exports = router;