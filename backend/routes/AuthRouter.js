// backend/routes/AuthRouter.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// --- AÑADE ESTAS DOS RUTAS ---
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;