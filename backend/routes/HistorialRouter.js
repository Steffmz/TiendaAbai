const express = require('express');
const router = express.Router();
const HistorialController = require('../controllers/HistorialController');
const authMiddleware = require('../middleware/authMiddleware');

// La ruta para obtener el historial siempre requiere autenticación
router.get('/', authMiddleware, HistorialController.getHistorial);

module.exports = router;