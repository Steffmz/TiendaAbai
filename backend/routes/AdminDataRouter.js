// backend/routes/AdminDataRouter.js
const express = require('express');
const router = express.Router();
const AdminDataController = require('../controllers/AdminDataController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Solo los admins pueden acceder a estos datos
router.use(adminMiddleware);

router.get('/cargos', AdminDataController.getCargos);
router.get('/centros-de-costos', AdminDataController.getCentrosDeCostos);

module.exports = router;