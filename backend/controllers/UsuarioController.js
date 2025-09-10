const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

exports.getAllUsuarios = async (req, res) => {
  const adminId = req.usuario.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  // --- AÑADIDO: Lógica para la búsqueda ---
  const searchQuery = req.query.search || '';

  const whereClause = {
    AND: [
      { id: { not: adminId } },
      { rol: { not: 'Administrador' } },
      {
        OR: [
          { nombreCompleto: { contains: searchQuery } },
          { cedula: { contains: searchQuery } },
        ],
      },
    ],
  };
  // --- FIN DE LÓGICA DE BÚSQUEDA ---

  try {
    const [usuarios, totalUsuarios] = await prisma.$transaction([
      prisma.usuario.findMany({
        where: whereClause, // Usamos la cláusula de búsqueda
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
        orderBy: { nombreCompleto: 'asc' },
        skip: skip,
        take: limit,
      }),
      prisma.usuario.count({ where: whereClause }) // Contamos solo los resultados filtrados
    ]);

    res.json({
      usuarios,
      total: totalUsuarios,
      page,
      limit
    });

  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// ... El resto del archivo no necesita cambios, puedes dejarlo como está
exports.createUsuario = async (req, res) => {
    const { cedula, nombreCompleto, email, contrasena, rol, sede, cargoId, centroDeCostosId } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                cedula,
                nombreCompleto,
                email,
                contrasena: hashedPassword,
                rol,
                sede,
                cargoId,
                centroDeCostosId,
                activo: true,
            },
        });
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
    await prisma.$transaction(async (tx) => {
      const userId = parseInt(id);
      await tx.historialPuntos.deleteMany({
        where: { beneficiarioId: userId },
      });
      await tx.historialPuntos.updateMany({
        where: { adminCreadorId: userId },
        data: { adminCreadorId: null }
      });
      await tx.pedido.updateMany({
          where: { aprobadoPorAdminId: userId },
          data: { aprobadoPorAdminId: null }
      });
      await tx.usuario.delete({
        where: { id: userId },
      });
    });
    
    res.status(200).json({ message: 'Usuario y su historial asociado eliminados permanentemente.' });
  } catch (error) {
    console.error(`Error al eliminar usuario ${id}:`, error);
    if (error.code === 'P2003') {
        return res.status(409).json({ message: 'No se puede eliminar el usuario porque aún tiene pedidos o canjes activos. Primero debe gestionarlos.' });
    }
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