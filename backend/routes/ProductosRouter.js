const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getAllProductos,
  getProductosByCategoria,
  createProducto,
  updateProducto,
  desactivarProducto,
  activarProducto
} = require('../controllers/ProductoController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `producto-${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

router.get('/', getAllProductos);
router.get('/categoria/:categoriaId', getProductosByCategoria);
router.post('/', upload.single('imagen'), createProducto);
router.put('/:id', upload.single('imagen'), updateProducto);

router.patch('/:id/desactivar', desactivarProducto);
router.patch('/:id/activar', activarProducto);

module.exports = router;
