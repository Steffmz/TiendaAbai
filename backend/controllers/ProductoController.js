const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtener todos los productos
const getAllProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
        campanas: true,
      },
      orderBy: { id: "desc" },
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// Obtener productos por categoría
const getProductosByCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    if (isNaN(categoriaId)) {
      return res.status(400).json({ error: "ID de categoría inválido" });
    }

    const productos = await prisma.producto.findMany({
      where: { categoriaId: parseInt(categoriaId) },
      include: {
        categoria: true,
        campanas: true,
      },
      orderBy: { id: "desc" },
    });

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    res.status(500).json({ error: "Error al obtener productos por categoría" });
  }
};

// Crear producto
const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precioPuntos, stock, categoriaId } = req.body;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nombre || !precioPuntos || !categoriaId) {
      return res.status(400).json({
        error: "El nombre, el precio en puntos y la categoría son campos obligatorios.",
      });
    }

    const precioPuntosNum = parseInt(precioPuntos);
    const stockNum = stock ? parseInt(stock) : 0;
    const categoriaIdNum = parseInt(categoriaId);

    if (isNaN(precioPuntosNum) || precioPuntosNum <= 0) {
      return res.status(400).json({ error: "El precio en puntos debe ser un número mayor a 0" });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ error: "El stock debe ser un número mayor o igual a 0" });
    }

    if (isNaN(categoriaIdNum)) {
      return res.status(400).json({ error: "ID de categoría inválido" });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaIdNum },
    });

    if (!categoria) {
      return res.status(404).json({ error: "La categoría especificada no existe" });
    }

    const nuevo = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precioPuntos: precioPuntosNum,
        stock: stockNum,
        imagenUrl,
        categoriaId: categoriaIdNum,
        estado: true, // activo por defecto
      },
      include: { categoria: true },
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Ocurrió un error inesperado al crear el producto." });
  }
};

// Actualizar producto
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precioPuntos, stock, categoriaId } = req.body;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    const productoExistente = await prisma.producto.findUnique({
      where: { id: Number(id) },
    });

    if (!productoExistente) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const precioPuntosNum = precioPuntos
      ? parseInt(precioPuntos)
      : productoExistente.precioPuntos;
    const stockNum = stock !== undefined ? parseInt(stock) : productoExistente.stock;
    const categoriaIdNum = categoriaId ? parseInt(categoriaId) : productoExistente.categoriaId;

    if (precioPuntos && (isNaN(precioPuntosNum) || precioPuntosNum <= 0)) {
      return res.status(400).json({ error: "El precio en puntos debe ser un número mayor a 0" });
    }

    if (stock !== undefined && (isNaN(stockNum) || stockNum < 0)) {
      return res.status(400).json({ error: "El stock debe ser un número mayor o igual a 0" });
    }

    if (categoriaId && categoriaIdNum !== productoExistente.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriaIdNum },
      });
      if (!categoria) {
        return res.status(404).json({ error: "La categoría especificada no existe" });
      }
    }

    const dataUpdate = {
      nombre: nombre ? nombre.trim() : productoExistente.nombre,
      descripcion:
        descripcion !== undefined
          ? descripcion
            ? descripcion.trim()
            : null
          : productoExistente.descripcion,
      precioPuntos: precioPuntosNum,
      stock: stockNum,
      categoriaId: categoriaIdNum,
    };

    if (imagenUrl) dataUpdate.imagenUrl = imagenUrl;

    const actualizado = await prisma.producto.update({
      where: { id: Number(id) },
      data: dataUpdate,
      include: { categoria: true },
    });

    res.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Ocurrió un error inesperado al actualizar el producto." });
  }
};

// Activar producto
const activarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
    });

    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    const actualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { estado: true },
    });

    res.json({ message: "Producto activado correctamente", producto: actualizado });
  } catch (error) {
    console.error("Error al activar producto:", error);
    res.status(500).json({ error: "Error al activar producto" });
  }
};

// Desactivar producto
const desactivarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
    });

    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    const actualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { estado: false },
    });

    res.json({ message: "Producto desactivado correctamente", producto: actualizado });
  } catch (error) {
    console.error("Error al desactivar producto:", error);
    res.status(500).json({ error: "Error al desactivar producto" });
  }
};

module.exports = {
  getAllProductos,
  getProductosByCategoria,
  createProducto,
  updateProducto,
  activarProducto,
  desactivarProducto,
};
