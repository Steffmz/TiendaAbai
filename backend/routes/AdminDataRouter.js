
const express = require('express');
const router = express.Router();
const AdminDataController = require('../controllers/AdminDataController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(adminMiddleware);

router.get('/cargos', AdminDataController.getCargos);
router.get('/centros-de-costos', AdminDataController.getCentrosDeCostos);

module.exports = router;