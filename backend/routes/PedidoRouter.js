const express = require('express');
const {
  crearPedido,
  aprobarPedido,
  getPedidos
} = require('../controllers/PedidoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getPedidos);
router.post('/', authMiddleware, crearPedido);
router.put('/:id/aprobar', authMiddleware, adminMiddleware, aprobarPedido);

module.exports = router;
