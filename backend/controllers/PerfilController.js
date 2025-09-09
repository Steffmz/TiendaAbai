// backend/controllers/PerfilController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtiene el perfil del usuario actualmente autenticado.
 * Se usa en los layouts para mostrar el nombre, puntos, etc.
 */
exports.getPerfil = async (req, res) => {
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
    res.status(500).json({ message: 'Error al obtener el perfil.' });
  }
};