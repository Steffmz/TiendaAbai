const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getCampanas,
  getCampanaById,
  createCampana,
  updateCampana,
  asignarProducto,
  quitarProducto,
  toggleEstadoCampana 
} = require('../controllers/CampanaController');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'campana-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 5MB.' });
    }
  }
  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ error: 'Solo se permiten archivos de imagen.' });
  }
  next(err);
};

// Definición de Rutas
router.get('/', getCampanas);
router.get('/:id', getCampanaById); 
router.post('/', upload.single('imagen'), handleMulterError, createCampana);
router.put('/:id', upload.single('imagen'), handleMulterError, updateCampana);
router.patch('/:id/toggle-estado', toggleEstadoCampana); 
router.post('/asignar-producto', asignarProducto);
router.post('/quitar-producto', quitarProducto);

module.exports = router;