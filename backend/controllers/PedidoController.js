const prisma = require('../config/prisma');

// Crear pedido a partir de detalles
const crearPedido = async (req, res) => {
  try {
    const { usuarioId, detalles } = req.body;
    const uid = parseInt(usuarioId);
    if (isNaN(uid) || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    let total = 0;
    const detallesData = [];

    for (const d of detalles) {
      const pid = parseInt(d.productoId);
      const qty = parseInt(d.cantidad);
      if (isNaN(pid) || isNaN(qty) || qty < 1) continue;

      const producto = await prisma.producto.findUnique({ where: { id: pid } });
      if (!producto) continue;
      const puntosUnitarios = producto.precioPuntos;
      total += puntosUnitarios * qty;
      detallesData.push({ productoId: pid, cantidad: qty, puntosUnitarios });
    }

    if (detallesData.length === 0) {
      return res.status(400).json({ error: 'Detalles inválidos' });
    }

    const pedido = await prisma.pedido.create({
      data: {
        usuarioId: uid,
        totalPuntos: total,
        detalles: { create: detallesData }
      },
      include: { detalles: true }
    });

    // Limpiar carrito del usuario
    await prisma.carrito.deleteMany({ where: { usuarioId: uid } });

    res.status(201).json(pedido);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
};

// Aprobar pedido por un administrador
const aprobarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;
    const pid = parseInt(id);
    const aid = parseInt(adminId);
    if (isNaN(pid) || isNaN(aid)) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const pedido = await prisma.pedido.update({
      where: { id: pid },
      data: {
        estado: 'Aprobado',
        aprobadoPorAdminId: aid,
        fechaAprobacion: new Date()
      }
    });

    await prisma.notificacion.create({
      data: {
        titulo: 'Pedido aprobado',
        mensaje: `Tu pedido #${pedido.id} ha sido aprobado`,
        usuarioId: pedido.usuarioId,
        pedidoId: pedido.id
      }
    });

    res.json({ message: 'Pedido aprobado', pedido });
  } catch (error) {
    console.error('Error al aprobar pedido:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.status(500).json({ error: 'Error al aprobar pedido' });
  }
};

// Obtener todos los pedidos
const getPedidos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { detalles: { include: { producto: true } }, usuario: true },
      orderBy: { id: 'desc' }
    });
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

module.exports = {
  crearPedido,
  aprobarPedido,
  getPedidos
};

