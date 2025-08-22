// backend/controllers/PedidoController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los pedidos
exports.getAllPedidos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        // Incluimos el nombre del usuario que hizo el pedido
        usuario: {
          select: {
            nombreCompleto: true,
          }
        },
        // Incluimos los detalles del pedido (qué productos y cuántos)
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
exports.updateEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const adminId = req.usuario.userId; // Obtenemos el ID del admin desde el token

  // Lista de estados válidos del enum 'pedido_estado' en tu schema.prisma
  const estadosValidos = ["Pendiente", "Aprobado", "Enviado", "Entregado", "Cancelado", "Rechazado"];

  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ message: 'El estado proporcionado no es válido.' });
  }

  try {
    const dataToUpdate = {
      estado,
    };

    // Si el estado es Aprobado o Rechazado, guardamos quién y cuándo lo hizo
    if (estado === 'Aprobado' || estado === 'Rechazado' || estado === 'Cancelado') {
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