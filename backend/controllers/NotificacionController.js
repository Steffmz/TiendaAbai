const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMisNotificaciones = async (req, res) => {
  const usuarioId = req.usuario.userId;
  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { fechaEnvio: 'desc' },
      take: 20, // Traemos solo las últimas 20 para no sobrecargar
    });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones.' });
  }
};