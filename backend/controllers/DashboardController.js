// backend/controllers/DashboardController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
  try {
    // 1. Conteo total de usuarios (solo empleados)
    const totalUsuarios = await prisma.usuario.count({
      where: { rol: 'Empleado' },
    });

    // 2. Conteo total de productos
    const totalProductos = await prisma.producto.count();

    // 3. Conteo de pedidos por estado
    const pedidosPorEstado = await prisma.pedido.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    });

    // 4. Productos más canjeados (Top 5)
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

    // Para obtener los nombres de los productos populares
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

    // 5. Devolvemos todo en un solo objeto
    res.json({
      totalUsuarios,
      totalProductos,
      pedidosPorEstado,
      productosPopulares: productosPopularesConNombre,
    });

  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ message: 'No se pudieron obtener las estadísticas del dashboard', details: error.message });
  }
};