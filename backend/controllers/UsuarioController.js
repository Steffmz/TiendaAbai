const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const xlsx = require('xlsx');

exports.getAllUsuarios = async (req, res) => {
  const adminId = req.usuario.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search || "";

  const whereClause = {
    AND: [
      { id: { not: adminId } },
      { rol: { not: "Administrador" } },
      {
        OR: [
          { nombreCompleto: { contains: searchQuery } },
          { cedula: { contains: searchQuery } },
        ],
      },
    ],
  };
  try {
    const [usuarios, totalUsuarios] = await prisma.$transaction([
      prisma.usuario.findMany({
        where: whereClause,
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
        orderBy: { nombreCompleto: "asc" },
        skip: skip,
        take: limit,
      }),
      prisma.usuario.count({ where: whereClause }),
    ]);

    res.json({
      usuarios,
      total: totalUsuarios,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.createUsuario = async (req, res) => {
  const {
    cedula,
    nombreCompleto,
    email,
    contrasena,
    rol,
    sede,
    cargoId,
    centroDeCostosId,
  } = req.body;

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
    if (error.code === "P2002" && error.meta?.target) {
      if (error.meta.target.includes('email')) {
        return res.status(409).json({ message: 'El correo electrónico ingresado ya está registrado.' });
      }
      if (error.meta.target.includes('cedula')) {
        return res.status(409).json({ message: 'La cédula ingresada ya está registrada.' });
      }
      return res.status(409).json({ message: 'Alguno de los datos ingresados ya está en uso.' });
    }
    
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Ocurrió un error inesperado al crear el usuario." });
  }
};

exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const {
    nombreCompleto,
    email,
    rol,
    sede,
    activo,
    cargoId,
    centroDeCostosId,
  } = req.body;

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
        centroDeCostosId: centroDeCostosId
          ? parseInt(centroDeCostosId)
          : undefined,
      },
    });
    res.json(usuarioActualizado);
  } catch (error) {
    console.error(`Error al actualizar usuario ${id}:`, error);
    res.status(500).json({ message: "Error al actualizar el usuario." });
  }
};

exports.toggleUsuarioStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { activo: !usuario.activo },
    });
    res.json({
      message: "Estado del usuario actualizado.",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error(`Error al cambiar estado del usuario ${id}:`, error);
    res
      .status(500)
      .json({ message: "Error al cambiar el estado del usuario." });
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
        data: { adminCreadorId: null },
      });
      await tx.pedido.updateMany({
        where: { aprobadoPorAdminId: userId },
        data: { aprobadoPorAdminId: null },
      });
      await tx.usuario.delete({
        where: { id: userId },
      });
    });

    res
      .status(200)
      .json({
        message: "Usuario y su historial asociado eliminados permanentemente.",
      });
  } catch (error) {
    console.error(`Error al eliminar usuario ${id}:`, error);
    if (error.code === "P2003") {
      return res
        .status(409)
        .json({
          message:
            "No se puede eliminar el usuario porque tiene pedidos o canjes activos. Por favor, gestione estos registros primero.",
        });
    }
    res.status(500).json({ message: "Error al eliminar el usuario." });
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

    if (contrasena && contrasena.trim() !== "") {
      if (!contrasenaActual || contrasenaActual.trim() === "") {
        return res
          .status(400)
          .json({
            message:
              "Para cambiar tu contraseña, debes proporcionar tu contraseña actual.",
          });
      }
      const esValida = await bcrypt.compare(
        contrasenaActual,
        usuario.contrasena
      );
      if (!esValida) {
        return res
          .status(401)
          .json({ message: "La contraseña actual es incorrecta." });
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
      return res.status(400).json({ message: 'No has realizado ningún cambio para actualizar.' });
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.status(200).json({ message: 'Tu perfil ha sido actualizado correctamente.' });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El correo electrónico ingresado ya está en uso por otra cuenta.' });
    }
    res.status(500).json({ message: 'Ocurrió un error inesperado al actualizar tu perfil.' });
  }
};
exports.ajustarPuntos = async (req, res) => {
  const { id } = req.params;
  const { puntos, descripcion } = req.body;
  const adminId = req.usuario.userId;

  if (typeof puntos !== 'number' || !descripcion) {
    return res.status(400).json({ message: 'Debes ingresar una cantidad de puntos y una descripción para el ajuste.' });
  }

  try {
    const usuarioActualizado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.update({
        where: { id: parseInt(id) },
        data: { puntosTotales: { increment: puntos } },
      });

      await tx.historialPuntos.create({
        data: {
          puntos: puntos,
          tipo: "ASIGNACION_MANUAL",
          descripcion: descripcion,
          beneficiarioId: usuario.id,
          adminCreadorId: adminId,
        },
      });
      return usuario;
    });

  res.json({ message: 'Los puntos del usuario han sido ajustados correctamente.', usuario: usuarioActualizado });
  } catch (error) {
    console.error(`Error al ajustar puntos para el usuario ${id}:`, error);
    res.status(500).json({ message: 'Ocurrió un error al intentar ajustar los puntos.' });
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
        puntosTotales: true,
      },
    });
    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado." });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil." });
  }
};
exports.importarUsuarios = async (req, res) => {
  // 1. Validar que se haya subido un archivo
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
  }

  try {
    // 2. Leer el archivo Excel desde la memoria
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const usuariosDesdeExcel = xlsx.utils.sheet_to_json(worksheet);

    if (usuariosDesdeExcel.length === 0) {
      return res.status(400).json({ message: 'El archivo Excel está vacío o tiene un formato incorrecto.' });
    }

    let creados = 0;
    const errores = [];

    // 3. Procesar cada usuario del Excel dentro de una transacción
    await prisma.$transaction(async (tx) => {
      for (const [index, usuarioData] of usuariosDesdeExcel.entries()) {
        const { Cedula, NombreCompleto, Email, Sede, Cargo, CentroDeCostos } = usuarioData;

        // Validar campos obligatorios
        if (!Cedula || !NombreCompleto || !Email || !Sede || !Cargo || !CentroDeCostos) {
          errores.push(`Fila ${index + 2}: Faltan datos obligatorios.`);
          continue;
        }

        // Verificar si el usuario ya existe por cédula o email
        const cedulaStr = String(Cedula);
        const existe = await tx.usuario.findFirst({
          where: { OR: [{ cedula: cedulaStr }, { email: Email }] },
        });

        if (existe) {
          errores.push(`Fila ${index + 2}: Usuario con cédula ${cedulaStr} o email ${Email} ya existe.`);
          continue;
        }

        // 4. Contraseña temporal (cédula) y hasheo
        const contrasenaTemporal = cedulaStr;
        const hashedPassword = await bcrypt.hash(contrasenaTemporal, 10);

        // 5. Buscar o crear Cargo y Centro de Costos
        const [cargoRecord, centroRecord] = await Promise.all([
          tx.cargos.upsert({
            where: { nombre: Cargo },
            update: {},
            create: { nombre: Cargo },
          }),
          tx.centroDeCostos.upsert({
            where: { nombre: CentroDeCostos },
            update: {},
            create: { nombre: CentroDeCostos },
          })
        ]);

        // Crear el usuario
        await tx.usuario.create({
          data: {
            cedula: cedulaStr,
            nombreCompleto: NombreCompleto,
            email: Email,
            sede: Sede,
            contrasena: hashedPassword,
            rol: 'Empleado',
            cargoId: cargoRecord.id,
            centroDeCostosId: centroRecord.id,
            activo: true
          },
        });
        creados++;
      }
    });

    res.status(200).json({
      message: 'Importación finalizada.',
      creados,
      errores,
    });

  } catch (error) {
    console.error("Error en la importación:", error);
    res.status(500).json({ message: 'Ocurrió un error inesperado durante la importación.' });
  }
};