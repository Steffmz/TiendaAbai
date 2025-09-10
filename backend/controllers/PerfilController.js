// backend/controllers/PerfilController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { InternalServerError } = require('../utils/ApiError');

/**
 * Obtiene el perfil del usuario actualmente autenticado.
 * Se usa en los layouts para mostrar el nombre, puntos, etc.
 */
exports.getPerfil = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.userId },
      select: { // Seleccionamos qué campos devolver para no enviar la contraseña
        id: true,
        nombreCompleto: true,
        email: true,
        puntosTotales: true,
        rol: true,
        sede: true,
        cargos: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json(usuario);
    
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    next(new InternalServerError('Error al obtener el perfil.'));
  }
};