
const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, PerfilController.getPerfil);

module.exports = router;