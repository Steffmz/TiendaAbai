const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/prisma');
const {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria
} = require('../controllers/CategoriaController');
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
router.post('/', upload.single('imagen'), createCategoria);

// Actualizar categoría
router.put('/:id', upload.single('imagen'), updateCategoria);

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Verificar si tiene productos asociados
    if (categoria._count.productos > 0) {
      const categoriaDesactivada = await prisma.categoria.update({
        where: { id: parseInt(id) },
        data: { activo: false }
      });

      console.log(`⚠️ Categoría desactivada (tiene productos): ${categoria.nombre}`);
      
      res.json({ 
        message: "Categoría desactivada correctamente (tiene productos asociados)",
        categoria: categoriaDesactivada
      });
    } else {
      await prisma.categoria.delete({
        where: { id: parseInt(id) }
      });

      console.log(`🗑️ Categoría eliminada: ${categoria.nombre}`);
      res.json({ message: "Categoría eliminada correctamente" });
    }

  } catch (error) {
    console.error("❌ Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
});

// Activar/Desactivar categoría
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const nuevoEstado = !categoria.activo;

    const categoriaActualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { activo: nuevoEstado }
    });

    console.log(`🔄 Categoría ${nuevoEstado ? 'activada' : 'desactivada'}: ${categoria.nombre}`);

    res.json({
      message: `Categoría ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`,
      categoria: categoriaActualizada
    });

  } catch (error) {
    console.error("❌ Error al cambiar estado de categoría:", error);
    res.status(500).json({ error: "Error al cambiar el estado de la categoría" });
  }
});

module.exports = router;
