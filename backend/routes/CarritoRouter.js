const express = require('express');
const {
  getCarritoByUsuario,
  addItem,
  updateItem,
  deleteItem
} = require('../controllers/CarritoController');

const router = express.Router();

router.get('/:usuarioId', getCarritoByUsuario);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;

