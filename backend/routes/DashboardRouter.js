// backend/routes/DashboardRouter.js
const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Todas las rutas de este archivo requieren ser administrador
router.use(adminMiddleware);

router.get('/stats', DashboardController.getStats);

module.exports = router;