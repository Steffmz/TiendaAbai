const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { InternalServerError } = require('../utils/ApiError');

exports.getMisNotificaciones = async (req, res, next) => {
  const usuarioId = req.usuario.userId;
  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { fechaEnvio: 'desc' },
      take: 20, // Traemos solo las últimas 20 para no sobrecargar
    });
    res.json(notificaciones);
  } catch (error) {
    next(new InternalServerError('Error al obtener notificaciones.'));
  }
};
exports.getUnreadCount = async (req, res, next) => {
  const usuarioId = req.usuario.userId;
  try {
    const count = await prisma.notificacion.count({
      where: {
        usuarioId,
        leido: false,
      },
    });
    res.json({ count });
  } catch (error) {
    next(new InternalServerError('Error al obtener el conteo.'));
  }
};

// Marcar todas las notificaciones como leídas
exports.markAllAsRead = async (req, res, next) => {
  const usuarioId = req.usuario.userId;
  try {
    await prisma.notificacion.updateMany({
      where: {
        usuarioId,
        leido: false,
      },
      data: {
        leido: true,
      },
    });
    res.status(200).json({ message: 'Notificaciones marcadas como leídas.' });
  } catch (error) {
    next(new InternalServerError('Error al marcar las notificaciones.'));
  }
};