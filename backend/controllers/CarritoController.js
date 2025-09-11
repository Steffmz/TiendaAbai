// backend/controllers/CarritoController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener el carrito de un usuario
exports.getCarrito = async (req, res) => {
  const usuarioId = req.usuario.userId;
  try {
    const carritoItems = await prisma.carrito.findMany({
      where: { usuarioId },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            precioPuntos: true,
            imagenUrl: true,
            stock: true,
          },
        },
      },
      orderBy: {
        fechaAgregado: 'desc',
      },
    });
    res.json(carritoItems);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ message: 'No se pudo obtener el carrito', details: error.message });
  }
};

// Agregar un producto al carrito
exports.agregarAlCarrito = async (req, res) => {
  const usuarioId = req.usuario.userId;
  const { productoId, cantidad } = req.body;

  if (!productoId || !cantidad || cantidad <= 0) {
    return res.status(400).json({ message: 'Producto y cantidad son requeridos.' });
  }

  try {
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    if (producto.stock < cantidad) {
      return res.status(400).json({ message: 'No hay suficiente stock para este producto.' });
    }

    const itemExistente = await prisma.carrito.findFirst({
      where: {
        usuarioId,
        productoId,
      },
    });

    if (itemExistente) {
      // Si el item ya existe, actualizamos la cantidad
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (producto.stock < nuevaCantidad) {
        return res.status(400).json({ message: 'La cantidad solicitada excede el stock disponible.' });
      }
      const itemActualizado = await prisma.carrito.update({
        where: { id: itemExistente.id },
        data: { cantidad: nuevaCantidad },
      });
      res.status(200).json({ message: 'Cantidad actualizada en el carrito.', item: itemActualizado });
    } else {
      // Si no existe, creamos un nuevo item en el carrito
      const nuevoItem = await prisma.carrito.create({
        data: {
          usuarioId,
          productoId,
          cantidad,
        },
      });
      res.status(201).json({ message: 'Producto agregado al carrito.', item: nuevoItem });
    }
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ message: 'No se pudo agregar el producto al carrito', details: error.message });
  }
};

// Eliminar un producto del carrito
exports.eliminarDelCarrito = async (req, res) => {
  const usuarioId = req.usuario.userId;
  const { productoId } = req.params;

  try {
    const itemEnCarrito = await prisma.carrito.findFirst({
      where: {
        usuarioId: usuarioId,
        productoId: parseInt(productoId),
      },
    });

    if (!itemEnCarrito) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    await prisma.carrito.delete({
      where: { id: itemEnCarrito.id },
    });

    res.json({ message: 'Producto eliminado del carrito.' });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ message: 'No se pudo eliminar el producto del carrito', details: error.message });
  }
};