const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/NotificacionController');
const authMiddleware = require('../middleware/authMiddleware');
// backend/routes/NotificacionRouter.js

// ... (imports)
router.get('/', authMiddleware, NotificacionController.getMisNotificaciones);
router.get('/unread-count', authMiddleware, NotificacionController.getUnreadCount); // <-- AÑADIR
router.post('/mark-as-read', authMiddleware, NotificacionController.markAllAsRead); // <-- AÑADIR

module.exports = router;