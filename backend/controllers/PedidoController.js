const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los pedidos con paginación
const getAllPedidos = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  try {
    const [pedidos, totalPedidos] = await prisma.$transaction([
      prisma.pedido.findMany({
        orderBy: { fecha: 'desc' },
        skip: skip,
        take: limit,
        include: {
          usuario: { select: { nombreCompleto: true } },
          detalles: { include: { producto: { select: { nombre: true } } } }
        }
      }),
      prisma.pedido.count()
    ]);

    res.json({
      pedidos,
      total: totalPedidos,
      page,
      limit
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


// Actualizar el estado de un pedido
const updateEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const adminId = req.usuario.userId;

  const estadosValidos = ["Pendiente", "Aprobado", "Enviado", "Entregado", "Cancelado", "Rechazado"];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ message: 'El estado proporcionado no es válido.' });
  }

  try {
    const pedidoActualizado = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({
        where: { id: parseInt(id) },
        include: { detalles: true }
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      const estadoAnterior = pedido.estado;
      
      if (['Cancelado', 'Rechazado'].includes(estado) && !['Cancelado', 'Rechazado'].includes(estadoAnterior)) {
        await tx.usuario.update({
          where: { id: pedido.usuarioId },
          data: { puntosTotales: { increment: pedido.totalPuntos } }
        });

        for (const detalle of pedido.detalles) {
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stock: { increment: detalle.cantidad } }
          });
        }
        
        await tx.historialPuntos.create({
          data: {
            puntos: pedido.totalPuntos,
            tipo: 'AJUSTE',
            descripcion: `Devolución por pedido #${pedido.id} ${estado.toLowerCase()}`,
            beneficiarioId: pedido.usuarioId,
            adminCreadorId: adminId,
          }
        });
      }

      const dataToUpdate = { estado };
      if (['Aprobado', 'Rechazado', 'Cancelado'].includes(estado)) {
        dataToUpdate.aprobadoPorAdminId = adminId;
        dataToUpdate.fechaAprobacion = new Date();
      }
      
      const pedidoActualizado = await tx.pedido.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
      });

      if (['Aprobado', 'Enviado', 'Rechazado', 'Cancelado'].includes(estado)) {
        let titulo = `Tu pedido #${pedido.id} ha sido ${estado.toLowerCase()}.`;
        let mensaje = `Tu canje ha sido actualizado al estado: ${estado}.`;
        await tx.notificacion.create({
          data: { titulo, mensaje, usuarioId: pedido.usuarioId, pedidoId: pedido.id }
        });
      }
      
      return pedidoActualizado;
    });

    res.json({ message: 'Estado del pedido actualizado.', pedido: pedidoActualizado });
  } catch (error) {
    console.error(`Error al actualizar estado del pedido ${id}:`, error);
    res.status(500).json({ message: error.message || 'Error al actualizar el estado del pedido.' });
  }
};

// Crear un nuevo pedido (Canje de un empleado)
const createPedido = async (req, res) => {
  const { productoId, cantidad } = req.body;
  const usuarioId = req.usuario.userId;

  if (!productoId || !cantidad || cantidad <= 0) {
    return res.status(400).json({ message: "Se requiere un producto y una cantidad válida." });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: parseInt(productoId) } });
      if (!producto) throw new Error("Producto no encontrado.");
      if (producto.stock < cantidad) throw new Error("No hay suficiente stock para este producto.");

      const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
      const costoTotalPuntos = producto.precioPuntos * cantidad;
      if (usuario.puntosTotales < costoTotalPuntos) {
        throw new Error("No tienes suficientes puntos para realizar este canje.");
      }

      await tx.usuario.update({
        where: { id: usuarioId },
        data: { puntosTotales: { decrement: costoTotalPuntos } },
      });

      await tx.producto.update({
        where: { id: parseInt(productoId) },
        data: { stock: { decrement: cantidad } },
      });

      const nuevoPedido = await tx.pedido.create({
        data: {
          usuarioId: usuarioId,
          totalPuntos: costoTotalPuntos,
          estado: 'Pendiente',
          detalles: {
            create: {
              productoId: parseInt(productoId),
              cantidad: parseInt(cantidad),
              puntosUnitarios: producto.precioPuntos,
            },
          },
        },
      });

      const admins = await tx.usuario.findMany({ where: { rol: 'Administrador' } });
      const notificacionesAdmin = admins.map(admin => tx.notificacion.create({
        data: {
          titulo: 'Nuevo Pedido Recibido',
          mensaje: `El usuario ${usuario.nombreCompleto} ha realizado un nuevo pedido (#${nuevoPedido.id}).`,
          usuarioId: admin.id,
          pedidoId: nuevoPedido.id
        }
      }));
      await Promise.all(notificacionesAdmin);

      await tx.historialPuntos.create({
        data: {
          puntos: -costoTotalPuntos,
          tipo: 'CANJE',
          descripcion: `Canje de ${cantidad} x ${producto.nombre}`,
          beneficiarioId: usuarioId,
          origenId: nuevoPedido.id,
        }
      });

      return nuevoPedido;
    });

    res.status(201).json({ message: '¡Canje realizado con éxito! Tu pedido está pendiente de aprobación.', pedido: resultado });

  } catch (error) {
    console.error("Error al crear el pedido:", error.message);
    res.status(400).json({ message: error.message || "Error interno del servidor al procesar el canje." });
  }
};

const getMisPedidos = async (req, res) => {
  const usuarioId = req.usuario.userId;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId: usuarioId },
      orderBy: { fecha: 'desc' },
      include: {
        detalles: {
          include: {
            producto: {
              select: {
                nombre: true,
                imagenUrl: true
              }
            }
          }
        }
      }
    });
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener mis pedidos:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const crearPedidoDesdeCarrito = async (req, res) => {
  const usuarioId = req.usuario.userId;
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const carritoItems = await tx.carrito.findMany({
        where: { usuarioId },
        include: { producto: true },
      });

      if (carritoItems.length === 0) {
        throw new Error("Tu carrito está vacío.");
      }

      let costoTotalPuntos = 0;
      for (const item of carritoItems) {
        if (item.producto.stock < item.cantidad) {
          throw new Error(`No hay suficiente stock para ${item.producto.nombre}.`);
        }
        costoTotalPuntos += item.producto.precioPuntos * item.cantidad;
      }

      const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
      if (usuario.puntosTotales < costoTotalPuntos) {
        throw new Error("No tienes suficientes puntos para realizar este canje.");
      }

      await tx.usuario.update({
        where: { id: usuarioId },
        data: { puntosTotales: { decrement: costoTotalPuntos } },
      });

      for (const item of carritoItems) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      const nuevoPedido = await tx.pedido.create({
        data: {
          usuarioId,
          totalPuntos: costoTotalPuntos,
          estado: 'Pendiente',
          detalles: {
            create: carritoItems.map(item => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              puntosUnitarios: item.producto.precioPuntos,
            })),
          },
        },
      });
      
      await tx.historialPuntos.create({
          data: {
              puntos: -costoTotalPuntos,
              tipo: 'CANJE',
              descripcion: `Canje del pedido #${nuevoPedido.id}`,
              beneficiarioId: usuarioId,
              origenId: nuevoPedido.id,
          }
      });
      
      await tx.carrito.deleteMany({ where: { usuarioId } });

      return nuevoPedido;
    });

    res.status(201).json({ message: '¡Canje realizado con éxito! Tu pedido está pendiente de aprobación.', pedido: resultado });

  } catch (error) {
    console.error("Error al crear el pedido desde el carrito:", error.message);
    res.status(400).json({ message: error.message || "Error interno del servidor." });
  }
};

module.exports = {
  getAllPedidos,
  updateEstadoPedido, 
  createPedido,
  crearPedidoDesdeCarrito,
  getMisPedidos
};