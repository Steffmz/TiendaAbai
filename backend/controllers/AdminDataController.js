const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los cargos
exports.getCargos = async (req, res) => {
  try {
    const cargos = await prisma.cargos.findMany({ orderBy: { nombre: 'asc' } });
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los cargos.' });
  }
};

// Obtener todos los centros de costos
exports.getCentrosDeCostos = async (req, res) => {
  try {
    const centros = await prisma.centroDeCostos.findMany({ orderBy: { nombre: 'asc' } });
    res.json(centros);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los centros de costos.' });
  }
};