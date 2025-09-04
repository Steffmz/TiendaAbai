const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/NotificacionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, NotificacionController.getMisNotificaciones);

module.exports = router;