const { PrismaClient } = require("@prisma/client");
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Helper para convertir valores a booleano de forma segura
const convertirABoolean = (valor) => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const lower = valor.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'activo';
  }
  return !!valor;
};

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { fechaCreacion: "desc" },
      include: { _count: { select: { productos: true } } }
    });
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
};

// Obtener categoría por ID
exports.getCategoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: { productos: { orderBy: { fechaCreacion: "desc" } } }
    });
    if (!categoria) return res.status(404).json({ message: "Categoría no encontrada" });
    res.json(categoria);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
};

// Crear categoría
exports.createCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
    }
    const nombreNormalizado = nombre.trim().toLowerCase();
    const categoriaExistente = await prisma.categoria.findFirst({ where: { nombre: nombreNormalizado } });
    if (categoriaExistente) {
      return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
    }
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre: nombreNormalizado,
        descripcion: descripcion ? descripcion.trim() : "",
        imagenUrl,
        activo: true
      }
    });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ error: "Ocurrió un error inesperado al intentar crear la categoría." });
  }
};

// Actualizar categoría
exports.updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activo } = req.body;
  try {
    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim().toLowerCase();
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion.trim();
    if (activo !== undefined) dataToUpdate.activo = convertirABoolean(activo);
    
    if (req.file) {
        const categoriaExistente = await prisma.categoria.findUnique({ where: { id: parseInt(id) } });
        if (categoriaExistente?.imagenUrl) {
            const oldImagePath = path.join(__dirname, '..', '..', categoriaExistente.imagenUrl);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
        dataToUpdate.imagenUrl = `/uploads/${req.file.filename}`;
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    res.json(categoriaActualizada);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
};

// Eliminar categoría
exports.deleteCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { productos: true } } }
    });
    if (!categoria) return res.status(404).json({ error: "Categoría no encontrada" });

if (categoria._count.productos > 0) {
      // Devolvemos un error claro en lugar de desactivar la categoría
      return res.status(400).json({ 
        error: "No se puede eliminar la categoría porque tiene productos asociados. Primero elimine los productos o muévalos a otra categoría." 
      });
    }
    
    if (categoria.imagenUrl) {
        const imagePath = path.join(__dirname, '..', '..', categoria.imagenUrl);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    
    await prisma.categoria.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
};

// Activar / Desactivar categoría
exports.toggleEstadoCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await prisma.categoria.findUnique({ where: { id: parseInt(id) } });
    if (!categoria) return res.status(404).json({ error: "Categoría no encontrada" });
    
    const categoriaActualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { activo: !categoria.activo }
    });
    res.json({ message: `Categoría ${categoriaActualizada.activo ? "activada" : "desactivada"}`, categoria: categoriaActualizada });
  } catch (error) {
    console.error("Error al cambiar estado de categoría:", error);
    res.status(500).json({ error: "Error al cambiar el estado" });
  }
};
