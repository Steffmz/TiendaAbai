// backend/routes/PerfilRouter.js

const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');
const authMiddleware = require('../middleware/authMiddleware');

// La ruta para obtener el perfil siempre requiere autenticación
router.get('/', authMiddleware, PerfilController.getPerfil);

module.exports = router;