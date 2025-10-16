const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// --- Rutas accesibles para cualquier usuario autenticado ---
router.post('/', authMiddleware, PedidoController.createPedido);
router.post('/desde-carrito', authMiddleware, PedidoController.crearPedidoDesdeCarrito);
router.get('/mis-pedidos', authMiddleware, PedidoController.getMisPedidos);
router.get('/:id', authMiddleware, PedidoController.getPedidoById);

// --- A partir de aquí, todas las rutas siguientes requieren ser Administrador ---
router.use(adminMiddleware);

router.get('/', PedidoController.getAllPedidos);
router.put('/:id/estado', PedidoController.updateEstadoPedido);

module.exports = router;
