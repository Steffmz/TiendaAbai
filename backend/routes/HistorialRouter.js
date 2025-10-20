const express = require('express');
const router = express.Router();
const HistorialController = require('../controllers/HistorialController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, HistorialController.getHistorial);

module.exports = router;