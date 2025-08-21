const express = require('express');
const {
  crearPedido,
  aprobarPedido,
  getPedidos
} = require('../controllers/PedidoController');

const router = express.Router();

router.get('/', getPedidos);
router.post('/', crearPedido);
router.put('/:id/aprobar', aprobarPedido);

module.exports = router;

