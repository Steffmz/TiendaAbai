// backend/routes/AuthRouter.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Ruta para registrar un nuevo usuario desde el formulario público
router.post('/register', AuthController.register);

// Ruta para iniciar sesión
router.post('/login', AuthController.login);

module.exports = router;