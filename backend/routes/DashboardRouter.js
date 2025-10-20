
const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(adminMiddleware);

router.get('/stats', DashboardController.getStats);

module.exports = router;