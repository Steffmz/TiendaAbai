const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los pedidos
const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          select: {
            nombreCompleto: true,
          }
        },
        detalles: {
          include: {
            producto: {
              select: {
                nombre: true,
              }
            }
          }
        }
      }
    });
    res.json(pedidos);
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
    const dataToUpdate = { estado };
    if (['Aprobado', 'Rechazado', 'Cancelado'].includes(estado)) {
      dataToUpdate.aprobadoPorAdminId = adminId;
      dataToUpdate.fechaAprobacion = new Date();
    }

    const pedidoActualizado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });
    res.json({ message: 'Estado del pedido actualizado.', pedido: pedidoActualizado });
  } catch (error) {
    console.error(`Error al actualizar estado del pedido ${id}:`, error);
    res.status(500).json({ message: 'Error al actualizar el estado del pedido.' });
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
      return nuevoPedido;
    });

    res.status(201).json({ message: '¡Canje realizado con éxito! Tu pedido está pendiente de aprobación.', pedido: resultado });

  } catch (error) {
    console.error("Error al crear el pedido:", error.message);
    res.status(400).json({ message: error.message || "Error interno del servidor al procesar el canje." });
  }
};

const getMisPedidos = async (req, res) => {
  const usuarioId = req.usuario.userId; // Obtenemos el ID del token
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

// --- ESTA ES LA CORRECCIÓN ---
// Exportamos todas las funciones juntas al final.
module.exports = {
  getAllPedidos,
  updateEstadoPedido, 
  createPedido,
  getMisPedidos
};