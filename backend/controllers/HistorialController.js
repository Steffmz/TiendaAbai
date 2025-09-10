const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { InternalServerError } = require('../utils/ApiError');

/**
 * Obtiene el historial de puntos del usuario autenticado.
 */
exports.getHistorial = async (req, res, next) => {
  const usuarioId = req.usuario.userId;

  try {
    const historial = await prisma.historialPuntos.findMany({
      where: { beneficiarioId: usuarioId },
      orderBy: { fecha: 'desc' }, // Ordenar del más reciente al más antiguo
    });

    res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener el historial de puntos:", error);
    next(new InternalServerError('Error interno del servidor.'));
  }
};