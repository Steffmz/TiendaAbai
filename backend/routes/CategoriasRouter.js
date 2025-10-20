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
  toggleEstadoCategoria
} = require('../controllers/CategoriaController');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `categoria-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen'));
  }
});
router.get('/', getCategorias);
router.get('/:id', getCategoriaById);
router.post('/', upload.single('imagen'), createCategoria);
router.put('/:id', upload.single('imagen'), updateCategoria);
router.delete('/:id', deleteCategoria);
router.patch('/:id/estado', toggleEstadoCategoria);

module.exports = router;
