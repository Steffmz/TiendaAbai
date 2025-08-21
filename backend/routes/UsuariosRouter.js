const express = require('express');
const {
  createUsuario,
  loginUsuario,
  asignarPuntos,
  getPerfil,
  getUsuarios,
  getUsuario,
  updateUsuario,
  deleteUsuario,
} = require('../controllers/UsuarioController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Registro y login
router.post('/usuarios', createUsuario);
router.post('/auth/login', loginUsuario);

// Perfil del usuario logueado
router.get('/api/perfil', authMiddleware, getPerfil);

// Acciones de administrador
router.post('/api/admin/usuarios/:id/puntos', authMiddleware, adminMiddleware, asignarPuntos);
router.get('/api/admin/usuarios', authMiddleware, adminMiddleware, getUsuarios);
router.get('/api/admin/usuarios/:id', authMiddleware, adminMiddleware, getUsuario);
router.put('/api/admin/usuarios/:id', authMiddleware, adminMiddleware, updateUsuario);
router.delete('/api/admin/usuarios/:id', authMiddleware, adminMiddleware, deleteUsuario);

module.exports = router;
