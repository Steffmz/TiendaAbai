const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generarMensajeNotificacion = (estado, pedidoId) => {
  const mensajes = {
    Aprobado: {
      titulo: `¡Tu pedido #${pedidoId} ha sido aprobado!`,
      mensaje: `Tu solicitud de canje ha sido aprobada por un administrador. Pronto será procesado para el envío.`,
    },
    Enviado: {
      titulo: `¡Tu pedido #${pedidoId} está en camino!`,
      mensaje: `Tu pedido ha sido enviado y está en tránsito. Pronto lo recibirás.`,
    },
    Entregado: {
      titulo: `¡Tu pedido #${pedidoId} ha sido entregado!`,
      mensaje: `Tu pedido ha sido entregado exitosamente. ¡Esperamos que disfrutes tu canje! Gracias por tu preferencia.`,
    },
    Rechazado: {
      titulo: `Tu pedido #${pedidoId} ha sido rechazado`,
      mensaje: `Lamentablemente, tu solicitud de canje no pudo ser aprobada. Tus puntos han sido devueltos a tu cuenta.`,
    },
    Cancelado: {
      titulo: `Tu pedido #${pedidoId} ha sido cancelado`,
      mensaje: `Tu pedido ha sido cancelado. Tus puntos han sido devueltos a tu cuenta.`,
    },
  };

  return (
    mensajes[estado] || {
      titulo: `Actualización de pedido #${pedidoId}`,
      mensaje: `Tu pedido ha sido actualizado al estado: ${estado}.`,
    }
  );
};

const getAllPedidos = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  try {
    const [pedidos, totalPedidos] = await prisma.$transaction([
      prisma.pedido.findMany({
        orderBy: { fecha: "desc" },
        skip,
        take: limit,
        include: {
          usuario: { select: { nombreCompleto: true } },
          detalles: { include: { producto: true } },
        },
      }),
      prisma.pedido.count(),
    ]);

    res.json({ pedidos, total: totalPedidos, page, limit });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const updateEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { estado: nuevoEstado } = req.body;
  const adminId = req.usuario.userId;

  const estadosValidos = ["Pendiente", "Aprobado", "Enviado", "Entregado", "Cancelado", "Rechazado"];
  if (!nuevoEstado || !estadosValidos.includes(nuevoEstado)) {
    return res.status(400).json({ message: "El estado proporcionado no es válido." });
  }

  try {
    const pedidoActualizado = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({
        where: { id: parseInt(id) },
        include: {
          detalles: true,
          usuario: { select: { nombreCompleto: true } },
        },
      });
      if (!pedido) throw new Error("Pedido no encontrado");

      const estadoAnterior = pedido.estado;
      if (estadoAnterior === nuevoEstado) return pedido; 

      const eraReembolsado = ["Cancelado", "Rechazado"].includes(estadoAnterior);
      const esReembolsado = ["Cancelado", "Rechazado"].includes(nuevoEstado);

      if (!eraReembolsado && esReembolsado) {
        await tx.usuario.update({
          where: { id: pedido.usuarioId },
          data: { puntosTotales: { increment: pedido.totalPuntos } },
        });

        for (const detalle of pedido.detalles) {
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stock: { increment: detalle.cantidad } },
          });
        }
        
        await tx.historialPuntos.create({
          data: {
            puntos: pedido.totalPuntos, 
            tipo: "AJUSTE",
            descripcion: `Devolución por pedido #${pedido.id} ${nuevoEstado.toLowerCase()}`,
            beneficiarioId: pedido.usuarioId,
            adminCreadorId: adminId,
          },
        });
      }

      else if (eraReembolsado && !esReembolsado) {
        const usuario = await tx.usuario.findUnique({ where: { id: pedido.usuarioId } });
        if (usuario.puntosTotales < pedido.totalPuntos) {
          throw new Error(`No se puede reactivar el pedido. El usuario solo tiene ${usuario.puntosTotales} puntos y se necesitan ${pedido.totalPuntos}.`);
        }

        await tx.usuario.update({
          where: { id: pedido.usuarioId },
          data: { puntosTotales: { decrement: pedido.totalPuntos } },
        });

        for (const detalle of pedido.detalles) {
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stock: { decrement: detalle.cantidad } },
          });
        }
        
        await tx.historialPuntos.create({
          data: {
            puntos: -pedido.totalPuntos, 
            tipo: "CANJE",
            descripcion: `Re-activación de canje para pedido #${pedido.id}`,
            beneficiarioId: pedido.usuarioId,
            adminCreadorId: adminId,
            origenId: pedido.id,
          },
        });
      }

      const dataToUpdate = { estado: nuevoEstado };
      if (["Aprobado", "Rechazado", "Cancelado"].includes(nuevoEstado)) {
        dataToUpdate.aprobadoPorAdminId = adminId;
        dataToUpdate.fechaAprobacion = new Date();
      }

      const pedidoActualizadoFinal = await tx.pedido.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
      });

      const { titulo, mensaje } = generarMensajeNotificacion(nuevoEstado, pedido.id);
      await tx.notificacion.create({
        data: {
          titulo,
          mensaje,
          usuarioId: pedido.usuarioId,
          pedidoId: pedido.id,
        },
      });

      return pedidoActualizadoFinal;
    });

    res.json({ message: "Estado actualizado correctamente.", pedido: pedidoActualizado });
  } catch (error) {
    console.error(`Error al actualizar estado del pedido ${id}:`, error);
    res.status(500).json({ message: error.message || "Error al actualizar estado del pedido." });
  }
};

const createPedido = async (req, res) => {
  const { productoId, cantidad } = req.body;
  const usuarioId = req.usuario.userId;

  if (!productoId || !cantidad || cantidad <= 0) {
    return res.status(400).json({ message: "Se requiere un producto y cantidad válida." });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: parseInt(productoId) } });
      if (!producto) throw new Error("Producto no encontrado.");
      if (producto.stock < cantidad) throw new Error("Stock insuficiente.");

      const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario) throw new Error("Usuario no encontrado.");

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
          usuarioId,
          totalPuntos: costoTotalPuntos,
          estado: "Pendiente",
          detalles: {
            create: {
              productoId: parseInt(productoId),
              cantidad: parseInt(cantidad),
              puntosUnitarios: producto.precioPuntos,
            },
          },
        },
      });

      const admins = await tx.usuario.findMany({ 
        where: { rol: "Administrador" },
        select: { id: true, nombreCompleto: true }
      });
      
      if (admins.length > 0) {
        await Promise.all(
          admins.map(admin => tx.notificacion.create({
            data: {
              titulo: "Nuevo Pedido Recibido",
              mensaje: `El usuario ${usuario.nombreCompleto} ha realizado un nuevo pedido (#${nuevoPedido.id}).`,
              usuarioId: admin.id,
              pedidoId: nuevoPedido.id,
            },
          }))
        );
      }

      await tx.historialPuntos.create({
        data: {
          puntos: -costoTotalPuntos,
          tipo: "CANJE",
          descripcion: `Canje de ${cantidad} x ${producto.nombre}`,
          beneficiarioId: usuarioId,
          origenId: nuevoPedido.id,
        },
      });

      return nuevoPedido;
    });

    res.status(201).json({
      message: "¡Canje realizado con éxito! Tu pedido está pendiente de aprobación.",
      pedido: resultado,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error.message);
    res.status(400).json({ message: error.message || "No se pudo procesar el canje." });
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
      if (carritoItems.length === 0) throw new Error("Tu carrito está vacío.");

      let costoTotalPuntos = 0;
      for (const item of carritoItems) {
        if (item.producto.stock < item.cantidad) {
          throw new Error(`No hay suficiente stock para ${item.producto.nombre}.`);
        }
        costoTotalPuntos += item.producto.precioPuntos * item.cantidad;
      }

      const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario) throw new Error("Usuario no encontrado.");
      if (usuario.puntosTotales < costoTotalPuntos) throw new Error("No tienes suficientes puntos.");

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
          estado: "Pendiente",
          detalles: {
            create: carritoItems.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              puntosUnitarios: item.producto.precioPuntos,
            })),
          },
        },
      });

      const admins = await tx.usuario.findMany({ 
        where: { rol: "Administrador" },
        select: { id: true, nombreCompleto: true }
      });
      
      if(admins.length > 0) {
        await Promise.all(
          admins.map(admin => tx.notificacion.create({
            data: {
              titulo: "Nuevo Pedido Recibido",
              mensaje: `El usuario ${usuario.nombreCompleto} ha realizado un nuevo pedido (#${nuevoPedido.id}).`,
              usuarioId: admin.id,
              pedidoId: nuevoPedido.id,
            },
          }))
        );
      }

      await tx.historialPuntos.create({
        data: {
          puntos: -costoTotalPuntos,
          tipo: "CANJE",
          descripcion: `Canje del pedido #${nuevoPedido.id}`,
          beneficiarioId: usuarioId,
          origenId: nuevoPedido.id,
        },
      });

      await tx.carrito.deleteMany({ where: { usuarioId } });

      return nuevoPedido;
    });

    res.status(201).json({
      message: "¡Canje realizado con éxito! Tu pedido está pendiente de aprobación.",
      pedido: resultado,
    });
  } catch (error) {
    console.error("Error al crear pedido desde carrito:", error.message);
    res.status(400).json({ message: error.message || "Error interno del servidor." });
  }
};

const getMisPedidos = async (req, res) => {
  const usuarioId = req.usuario.userId;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId },
      orderBy: { fecha: "desc" },
      include: {
        detalles: { include: { producto: { select: { nombre: true, imagenUrl: true } } } },
      },
    });
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener mis pedidos:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const getPedidoById = async (req, res) => {
  const { id } = req.params;
  const { userId, rol } = req.usuario;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: { select: { nombreCompleto: true } },
        aprobadoPor: { select: { nombreCompleto: true } },
        detalles: { include: { producto: true } },
      },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }
    if (rol !== 'Administrador' && pedido.usuarioId !== userId) {
      return res.status(403).json({ message: "Acceso denegado. No tienes permiso para ver este recibo." });
    }
    res.json(pedido);
  } catch (error) {
    console.error("Error al obtener el pedido:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = {
  getAllPedidos,
  updateEstadoPedido,
  createPedido,
  crearPedidoDesdeCarrito,
  getMisPedidos,
  getPedidoById
};
