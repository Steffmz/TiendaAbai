const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtiene el historial de puntos del usuario autenticado.
 */
exports.getHistorial = async (req, res) => {
  const usuarioId = req.usuario.userId;

  try {
    const historial = await prisma.historialPuntos.findMany({
      where: { beneficiarioId: usuarioId },
      orderBy: { fecha: 'desc' }, // Ordenar del más reciente al más antiguo
    });

    res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener el historial de puntos:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};