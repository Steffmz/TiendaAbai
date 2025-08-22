// backend/routes/PedidoRouter.js

const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protegemos todas las rutas de pedidos para que solo los admins puedan acceder
router.use(adminMiddleware);

// GET /api/pedidos - Obtiene todos los pedidos
router.get('/', PedidoController.getAllPedidos);

// PUT /api/pedidos/:id/estado - Actualiza el estado de un pedido
router.put('/:id/estado', PedidoController.updateEstadoPedido);

module.exports = router;