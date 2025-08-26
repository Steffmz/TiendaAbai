const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// --- Importamos los dos middlewares ---
const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware');

// --- Rutas de Perfil (protegidas por autenticación general) ---
router.get('/me', authMiddleware, UsuarioController.getMiPerfil);
router.put('/me', authMiddleware, UsuarioController.updateMiPerfil);

// --- Rutas de Administración (protegidas por el middleware de admin) ---
router.use(adminMiddleware);

router.get('/', UsuarioController.getAllUsuarios);
router.post('/', UsuarioController.createUsuario);
router.put('/:id', UsuarioController.updateUsuario);
router.patch('/:id/toggle-status', UsuarioController.toggleUsuarioStatus);
router.delete('/:id', UsuarioController.deleteUsuario);

module.exports = router;