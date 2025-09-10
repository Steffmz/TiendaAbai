const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { InternalServerError } = require('../utils/ApiError');

// Obtener todos los cargos
exports.getCargos = async (req, res, next) => {
  try {
    const cargos = await prisma.cargos.findMany({ orderBy: { nombre: 'asc' } });
    res.json(cargos);
  } catch (error) {
    next(new InternalServerError('Error al obtener los cargos.'));
  }
};

// Obtener todos los centros de costos
exports.getCentrosDeCostos = async (req, res, next) => {
  try {
    const centros = await prisma.centroDeCostos.findMany({ orderBy: { nombre: 'asc' } });
    res.json(centros);
  } catch (error) {
    next(new InternalServerError('Error al obtener los centros de costos.'));
  }
};