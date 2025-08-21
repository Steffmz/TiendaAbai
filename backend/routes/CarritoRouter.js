const express = require('express');
const {
  getCarritoByUsuario,
  addItem,
  updateItem,
  deleteItem
} = require('../controllers/CarritoController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:usuarioId', authMiddleware, getCarritoByUsuario);
router.post('/', authMiddleware, addItem);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
