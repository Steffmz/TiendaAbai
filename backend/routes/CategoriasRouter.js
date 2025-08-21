const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  toggleEstadoCategoria,
} = require('../controllers/CategoriaController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

// Crear carpeta uploads si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📂 Carpeta creada: ${uploadDir}`);
}

// Configuración de multer para categorías
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `categoria-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Obtener todas las categorías
router.get('/', getCategorias);

// Obtener categoría por ID con sus productos
router.get('/:id', getCategoriaById);

// Crear nueva categoría
router.post('/', authMiddleware, adminMiddleware, upload.single('imagen'), createCategoria);

// Actualizar categoría
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imagen'), updateCategoria);

// Eliminar categoría
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategoria);

// Activar/Desactivar categoría
router.patch('/:id/estado', authMiddleware, adminMiddleware, toggleEstadoCategoria);

module.exports = router;
