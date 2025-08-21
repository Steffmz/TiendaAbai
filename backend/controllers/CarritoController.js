const prisma = require('../config/prisma');

// Obtener items del carrito por usuario
const getCarritoByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const items = await prisma.carrito.findMany({
      where: { usuarioId: parseInt(usuarioId) },
      include: { producto: true }
    });

    res.json(items);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

// Agregar item al carrito (o incrementar si ya existe)
const addItem = async (req, res) => {
  try {
    const { usuarioId, productoId, cantidad } = req.body;
    const uid = parseInt(usuarioId);
    const pid = parseInt(productoId);
    const qty = parseInt(cantidad) || 1;

    if (isNaN(uid) || isNaN(pid) || isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const item = await prisma.carrito.upsert({
      where: { usuarioId_productoId: { usuarioId: uid, productoId: pid } },
      update: { cantidad: { increment: qty } },
      create: { usuarioId: uid, productoId: pid, cantidad: qty }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

// Actualizar cantidad de un item del carrito
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    const cid = parseInt(id);
    const qty = parseInt(cantidad);

    if (isNaN(cid) || isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const item = await prisma.carrito.update({
      where: { id: cid },
      data: { cantidad: qty }
    });

    res.json(item);
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar carrito' });
  }
};

// Eliminar item del carrito
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cid = parseInt(id);
    if (isNaN(cid)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await prisma.carrito.delete({ where: { id: cid } });
    res.json({ message: 'Item eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
};

module.exports = {
  getCarritoByUsuario,
  addItem,
  updateItem,
  deleteItem
};

