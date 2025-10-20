
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
  try {
    const totalUsuarios = await prisma.usuario.count({
      where: { rol: 'Empleado' },
    });

    const totalProductos = await prisma.producto.count();

    const pedidosPorEstado = await prisma.pedido.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    const productosPopulares = await prisma.pedidoDetalle.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: 5,
    });

    const productoIds = productosPopulares.map(p => p.productoId);
    const productosInfo = await prisma.producto.findMany({
      where: { id: { in: productoIds } },
      select: { id: true, nombre: true },
    });

    const productosPopularesConNombre = productosPopulares.map(p => {
      const info = productosInfo.find(info => info.id === p.productoId);
      return {
        nombre: info ? info.nombre : 'Producto Desconocido',
        cantidad: p._sum.cantidad,
      };
    });

    res.json({
      totalUsuarios,
      totalProductos,
      pedidosPorEstado,
      productosPopulares: productosPopularesConNombre,
    });

  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};