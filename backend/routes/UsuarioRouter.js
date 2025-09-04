const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware');

// --- Rutas de Perfil (protegidas por autenticación general) ---

router.put('/me', authMiddleware, UsuarioController.updateMiPerfil);

router.get('/me', authMiddleware, UsuarioController.getMiPerfil); 
router.put('/me', authMiddleware, UsuarioController.updateMiPerfil);

router.use(adminMiddleware);

router.get('/', UsuarioController.getAllUsuarios);
router.post('/', UsuarioController.createUsuario);
router.put('/:id', UsuarioController.updateUsuario);
router.patch('/:id/toggle-status', UsuarioController.toggleUsuarioStatus);
router.delete('/:id', UsuarioController.deleteUsuario);
router.post('/:id/puntos', UsuarioController.ajustarPuntos);

module.exports = router;