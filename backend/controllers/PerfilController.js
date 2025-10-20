
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPerfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.userId },
      select: { 
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