const { convertirABoolean } = require("../utils/boolean");
const prisma = require('../config/prisma');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { fechaCreacion: "desc" },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    });
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
};

// Obtener categoría por ID con sus productos
const getCategoriaById = async (req, res) => {
  const { id } = req.params;

  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        productos: {
          orderBy: { fechaCreacion: "desc" }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({
      categoria,
      productos: categoria.productos
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
};

// Crear categoría
const createCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
    }

    const nombreNormalizado = nombre.trim().toLowerCase();

    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nombre: nombreNormalizado
      }
    });

    if (categoriaExistente) {
      return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
    }

    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : "/uploads/categoria-default.png";

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
    res.status(500).json({ error: "Error al crear la categoría" });
  }
};

// Actualizar categoría
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado, activo } = req.body;

    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoriaExistente) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    if (nombre !== undefined && (!nombre || nombre.trim() === "")) {
      return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
    }

    if (nombre) {
      const nombreBuscado = nombre.trim().toLowerCase();

      if (nombreBuscado !== categoriaExistente.nombre.toLowerCase()) {
        const otraCategoria = await prisma.categoria.findFirst({
          where: {
            nombre: nombreBuscado,
            id: { not: parseInt(id) }
          }
        });

        if (otraCategoria) {
          return res
            .status(400)
            .json({ error: "Ya existe otra categoría con ese nombre" });
        }
      }
    }

    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim().toLowerCase();
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion.trim();

    const estadoValor = estado !== undefined ? estado : activo;
    if (estadoValor !== undefined) {
      dataToUpdate.activo = convertirABoolean(estadoValor);
    }

    if (req.file) dataToUpdate.imagenUrl = `/uploads/${req.file.filename}`;

    const categoriaActualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json(categoriaActualizada);
  } catch (error) {
    console.error("❌ Error al actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
};

// Eliminar categoría
const deleteCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { productos: true } } }
    });

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    if (categoria._count.productos > 0) {
      const categoriaDesactivada = await prisma.categoria.update({
        where: { id: parseInt(id) },
        data: { activo: false }
      });

      res.json({
        message: "Categoría desactivada correctamente (tiene productos asociados)",
        categoria: categoriaDesactivada
      });
    } else {
      await prisma.categoria.delete({
        where: { id: parseInt(id) }
      });

      res.json({ message: "Categoría eliminada correctamente" });
    }
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
};

// Activar / Desactivar categoría
const toggleEstadoCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) }
    });

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { activo: !categoria.activo }
    });

    res.json({
      message: `Categoría ${categoriaActualizada.activo ? "activada" : "desactivada"} correctamente`,
      categoria: categoriaActualizada
    });
  } catch (error) {
    console.error("Error al cambiar estado de categoría:", error);
    res.status(500).json({ error: "Error al cambiar el estado de la categoría" });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  toggleEstadoCategoria
};
