const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (para el admin)
exports.getAllUsuarios = async (req, res) => {
  const adminId = req.usuario.userId;

  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        // Añadimos una condición AND para que se cumplan ambas reglas
        AND: [
          {
            id: {
              not: adminId // Regla 1: No mostrarse a sí mismo
            }
          },
          {
            rol: {
              not: 'Administrador' // Regla 2: No mostrar otros administradores
            }
          }
        ]
      },
      select: {
        id: true,
        cedula: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        activo: true,
        puntosTotales: true,
        sede: true,
        cargos: { select: { id: true, nombre: true } },
        centroDeCostos: { select: { id: true, nombre: true } },
      },
      orderBy: {
        nombreCompleto: 'asc'
      }
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
// Crear un nuevo usuario (desde el panel de admin)
// backend/controllers/UsuarioController.js

// ... (otras funciones) ...

exports.createUsuario = async (req, res) => {
    // ASEGÚRATE DE QUE 'sede' ESTÉ AQUÍ
    const { cedula, nombreCompleto, email, contrasena, rol, sede, cargoId, centroDeCostosId } = req.body;

    // Y AQUÍ EN LA VALIDACIÓN
    if (!cedula || !nombreCompleto || !email || !contrasena || !rol || !sede || !cargoId || !centroDeCostosId) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                cedula,
                nombreCompleto,
                email,
                contrasena: hashedPassword,
                rol,
                sede, // <-- El campo ya está aquí, que es lo correcto
                cargoId: parseInt(cargoId),
                centroDeCostosId: parseInt(centroDeCostosId),
                activo: true,
            },
        });
        // Por seguridad, no devolvemos la contraseña
        const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;
        res.status(201).json(usuarioSinContrasena);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: `El campo '${error.meta.target[0]}' ya está en uso.` });
        }
        console.error("Error al crear usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// ... (resto de funciones) ...

// Actualizar un usuario existente
exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombreCompleto, email, rol, sede, activo, cargoId, centroDeCostosId } = req.body;

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        nombreCompleto,
        email,
        rol,
        sede,
        activo,
        cargoId: cargoId ? parseInt(cargoId) : undefined,
        centroDeCostosId: centroDeCostosId ? parseInt(centroDeCostosId) : undefined
      },
    });
    res.json(usuarioActualizado);
  } catch (error) {
    console.error(`Error al actualizar usuario ${id}:`, error);
    res.status(500).json({ message: 'Error al actualizar el usuario.' });
  }
};

// Desactivar/Activar un usuario (Soft Delete)
exports.toggleUsuarioStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const usuarioActualizado = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { activo: !usuario.activo },
        });
        res.json({ message: 'Estado del usuario actualizado.', usuario: usuarioActualizado });
    } catch (error) {
        console.error(`Error al cambiar estado del usuario ${id}:`, error);
        res.status(500).json({ message: 'Error al cambiar el estado del usuario.' });
    }
};
exports.deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // Aquí podrías añadir lógica para eliminar relaciones si es necesario
    // Por ahora, lo eliminaremos directamente.
    await prisma.usuario.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Usuario eliminado permanentemente.' });
  } catch (error) {
    console.error(`Error al eliminar usuario ${id}:`, error);
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};

exports.updateMiPerfil = async (req, res) => {
  const userId = req.usuario.userId;
  const { nombreCompleto, email, contrasena, contrasenaActual } = req.body;

  try {
    const dataToUpdate = {};
    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (contrasena && contrasena.trim() !== '') {
      if (!contrasenaActual || contrasenaActual.trim() === '') {
        return res.status(400).json({ message: 'Para cambiar tu contraseña, debes proporcionar tu contraseña actual.' });
      }
      const esValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
      if (!esValida) {
        return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
      }
      dataToUpdate.contrasena = await bcrypt.hash(contrasena, 10);
    }

    if (nombreCompleto && nombreCompleto !== usuario.nombreCompleto) {
      dataToUpdate.nombreCompleto = nombreCompleto;
    }
    if (email && email !== usuario.email) {
      dataToUpdate.email = email;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.status(200).json({ message: 'Perfil actualizado correctamente.' });

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El email ya está en uso por otro usuario.' });
    }
    res.status(500).json({ message: 'Error interno del servidor al actualizar el perfil.' });
  }
};
exports.ajustarPuntos = async (req, res) => {
  const { id } = req.params;
  const { puntos, descripcion } = req.body;
  const adminId = req.usuario.userId;

  if (typeof puntos !== 'number' || !descripcion) {
    return res.status(400).json({ message: 'Se requieren puntos (número) y una descripción.' });
  }

  try {
    const usuarioActualizado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.update({
        where: { id: parseInt(id) },
        data: { puntosTotales: { increment: puntos } }
      });

      await tx.historialPuntos.create({
        data: {
          puntos: puntos,
          tipo: 'ASIGNACION_MANUAL',
          descripcion: descripcion,
          beneficiarioId: usuario.id,
          adminCreadorId: adminId
        }
      });
      return usuario;
    });

    res.json({ message: 'Puntos ajustados correctamente.', usuario: usuarioActualizado });
  } catch (error) {
    console.error(`Error al ajustar puntos para el usuario ${id}:`, error);
    res.status(500).json({ message: 'Error al ajustar los puntos.' });
  }
};
exports.getMiPerfil = async (req, res) => {
  const userId = req.usuario.userId;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        nombreCompleto: true,
        email: true,
        cedula: true,
        puntosTotales: true, // Asegúrate de incluir los puntos
      }
    });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil.' });
  }
};