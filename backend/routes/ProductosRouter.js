const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getProductosByCategoria,
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} = require('../controllers/ProductoController');

const router = express.Router();

// carpeta uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `producto-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Solo imágenes (jpeg,jpg,png,gif,webp)'));
  }
});

// Rutas
router.get('/', getAllProductos);
router.get('/categoria/:categoriaId', getProductosByCategoria);
router.get('/:id', getProductoById);
router.post('/', upload.single('imagen'), createProducto);
router.put('/:id', upload.single('imagen'), updateProducto);
router.delete('/:id', deleteProducto);

module.exports = router;
