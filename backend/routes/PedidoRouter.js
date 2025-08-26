const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Un usuario autenticado (empleado o admin) puede crear un pedido
router.post('/', authMiddleware, PedidoController.createPedido);

// Las siguientes rutas solo son para administradores
router.use(adminMiddleware);

router.get('/', PedidoController.getAllPedidos);
router.put('/:id/estado', PedidoController.updateEstadoPedido);

module.exports = router;