// controllers/ProductoController.js
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const parseOptionalInt = (v, defaultValue = 0) => {
  if (v === undefined || v === null || v === '') return defaultValue;
  const n = parseInt(v);
  return Number.isNaN(n) ? defaultValue : n;
};

const getProductosByCategoria = async (req, res) => {
  const { categoriaId } = req.params;
  try {
    const productos = await prisma.producto.findMany({
      where: { categoriaId: parseInt(categoriaId) },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const getAllProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { fechaCreacion: 'desc' },
      include: { categoria: true } // opcional
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await prisma.producto.findUnique({ where: { id: parseInt(id) }});
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precioPuntos, stock, categoriaId, estado } = req.body;
    // La imagen ahora se guarda en uploads/productos/
    const imagenUrl = req.file ? `/uploads/productos/${req.file.filename}` : (req.body.imagenUrl || null);

    if (!nombre || !categoriaId) {
      return res.status(400).json({ error: 'Nombre y categoriaId son obligatorios' });
    }

    const nuevo = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precioPuntos: parseOptionalInt(precioPuntos, 0),
        stock: parseOptionalInt(stock, 0),
        imagenUrl,
        categoriaId: parseInt(categoriaId),
        estado: estado === undefined ? true : (estado === 'false' || estado === '0' ? false : Boolean(estado)),
      }
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const updateProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const productoExistente = await prisma.producto.findUnique({ where: { id: parseInt(id) }});
    if (!productoExistente) return res.status(404).json({ error: 'Producto no encontrado' });

    const { nombre, descripcion, precioPuntos, stock, categoriaId, estado, imagenUrl: imagenUrlBody } = req.body;
    
    // Si hay nueva imagen, usar la nueva ruta con /productos/
    let imagenUrl;
    if (req.file) {
      imagenUrl = `/uploads/productos/${req.file.filename}`;
      
      // Eliminar imagen anterior si existe y hay una nueva
      if (productoExistente.imagenUrl && productoExistente.imagenUrl.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', productoExistente.imagenUrl);
        if (fs.existsSync(oldImagePath)) {
          try { 
            fs.unlinkSync(oldImagePath); 
          } catch(e) { 
            console.warn('No se pudo borrar imagen anterior:', e.message); 
          }
        }
      }
    } else if (imagenUrlBody !== undefined) {
      imagenUrl = imagenUrlBody;
    } else {
      imagenUrl = productoExistente.imagenUrl;
    }

    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion.trim();
    if (precioPuntos !== undefined) dataToUpdate.precioPuntos = parseOptionalInt(precioPuntos, productoExistente.precioPuntos);
    if (stock !== undefined) dataToUpdate.stock = parseOptionalInt(stock, productoExistente.stock);
    if (categoriaId !== undefined) dataToUpdate.categoriaId = parseInt(categoriaId);
    if (estado !== undefined) dataToUpdate.estado = (estado === 'false' || estado === '0') ? false : Boolean(estado);
    if (imagenUrl !== undefined) dataToUpdate.imagenUrl = imagenUrl;

    const updated = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await prisma.producto.findUnique({ where: { id: parseInt(id) }});
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    // Eliminar archivo de imagen si existe (ahora busca en uploads/productos/ también)
    if (producto.imagenUrl && producto.imagenUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', producto.imagenUrl);
      if (fs.existsSync(imagePath)) {
        try { 
          fs.unlinkSync(imagePath); 
          console.log('Imagen eliminada:', imagePath);
        } catch(e) { 
          console.warn('No se pudo borrar imagen:', e.message); 
        }
      }
    }

    await prisma.producto.delete({ where: { id: parseInt(id) }});
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  getProductosByCategoria,
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};