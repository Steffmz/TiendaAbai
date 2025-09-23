const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware');
const validate = require('../middleware/validateRequest');
const { createUserSchema } = require('../utils/validationSchemas');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/me', authMiddleware, UsuarioController.getMiPerfil); 
router.put('/me', authMiddleware, UsuarioController.updateMiPerfil);

router.use(adminMiddleware);

router.get('/', UsuarioController.getAllUsuarios);
router.post('/', validate(createUserSchema), UsuarioController.createUsuario);
router.post('/importar', upload.single('archivo'), UsuarioController.importarUsuarios);
router.put('/:id', UsuarioController.updateUsuario);
router.patch('/:id/toggle-status', UsuarioController.toggleUsuarioStatus);
router.delete('/:id', UsuarioController.deleteUsuario);
router.post('/:id/puntos', UsuarioController.ajustarPuntos);

module.exports = router;