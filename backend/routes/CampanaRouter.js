const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getCampanas,
  getCampanaById,
  createCampana,
  updateCampana,
  deleteCampana,
  asignarProducto,
  quitarProducto
} = require('../controllers/CampanaController');

const router = express.Router();

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Directorio uploads creado:', uploadsDir);
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

// Filtro para solo permitir imágenes
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
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 1 
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Solo se permite subir un archivo a la vez.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Campo de archivo inesperado.' });
    }
  }
  
  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ error: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.).' });
  }
  
  next(err);
};

//  Rutas
router.get('/', getCampanas);
router.get('/:id', getCampanaById); 
router.post('/', upload.single('imagen'), handleMulterError, createCampana);
router.put('/:id', upload.single('imagen'), handleMulterError, updateCampana);
router.delete('/:id', deleteCampana);
router.post('/asignar-producto', asignarProducto);
router.post('/quitar-producto', quitarProducto);

module.exports = router;