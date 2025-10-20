const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/NotificacionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, NotificacionController.getMisNotificaciones);
router.get('/unread-count', authMiddleware, NotificacionController.getUnreadCount); 
router.post('/mark-as-read', authMiddleware, NotificacionController.markAllAsRead); 

module.exports = router;