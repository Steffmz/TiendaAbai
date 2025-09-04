// backend/routes/CarritoRouter.js

const express = require('express');
const router = express.Router();
const CarritoController = require('../controllers/CarritoController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas del carrito requieren autenticación
router.use(authMiddleware);

router.get('/', CarritoController.getCarrito);
router.post('/', CarritoController.agregarAlCarrito);
router.delete('/:productoId', CarritoController.eliminarDelCarrito);

module.exports = router;