// backend/routes/UsuarioRouter.js

const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Proteger todas estas rutas para que solo los admins puedan acceder
router.use(adminMiddleware);

router.get('/', UsuarioController.getAllUsuarios);
router.post('/', UsuarioController.createUsuario);
router.put('/:id', UsuarioController.updateUsuario);
router.patch('/:id/toggle-status', UsuarioController.toggleUsuarioStatus); // Usamos PATCH para una acción específica

module.exports = router;