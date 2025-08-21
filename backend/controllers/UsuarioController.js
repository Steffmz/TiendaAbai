const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Crear un nuevo usuario (registro)
const createUsuario = async (req, res) => {
  const {
    cedula,
    nombreCompleto,
    cargoNombre,
    sede,
    email,
    contrasena,
    rol,
    centroDeCostosNombre,
  } = req.body;

  try {
    if (
      !email ||
      !contrasena ||
      !cedula ||
      !nombreCompleto ||
      !cargoNombre ||
      !sede ||
      !centroDeCostosNombre
    ) {
      return res.status(400).json({
        message:
          "Todos los campos, incluido el cargo y el centro de costos, son requeridos.",
      });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const centroDeCostos = await prisma.centroDeCostos.upsert({
      where: { nombre: centroDeCostosNombre },
      update: {},
      create: { nombre: centroDeCostosNombre },
    });

    const cargo = await prisma.cargo.upsert({
      where: { nombre: cargoNombre },
      update: {},
      create: { nombre: cargoNombre },
    });

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombreCompleto,
        sede,
        email,
        contrasena: hashedPassword,
        rol,
        centroDeCostos: { connect: { id: centroDeCostos.id } },
        cargo: { connect: { id: cargo.id } },
      },
    });

    const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;
    res.status(201).json(usuarioSinContrasena);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `El campo '${error.meta.target[0]}' ya está en uso.`,
      });
    }

    console.error("Error al crear usuario:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear el usuario." });
  }
};

// Login de usuario
const loginUsuario = async (req, res) => {
  const { cedula, contrasena } = req.body;

  try {
    if (!cedula || !contrasena) {
      return res
        .status(400)
        .json({ message: "La cédula y la contraseña son requeridas." });
    }

    const usuario = await prisma.usuario.findUnique({ where: { cedula } });

    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const payload = {
      userId: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombreCompleto,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      message: "Inicio de sesión exitoso",
      token: token,
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Asignar/restar puntos a un usuario
const asignarPuntos = async (req, res) => {
  const beneficiarioId = parseInt(req.params.id);
  const { puntos, descripcion } = req.body;
  const adminId = req.usuario.userId;

  if (typeof puntos !== "number" || !descripcion) {
    return res.status(400).json({
      message: "Se requiere un número de puntos y una descripción.",
    });
  }

  try {
    const [_, updatedUsuario] = await prisma.$transaction([
      prisma.historialPuntos.create({
        data: {
          puntos: puntos,
          tipo: "ASIGNACION_MANUAL",
          descripcion: descripcion,
          beneficiarioId: beneficiarioId,
          adminCreadorId: adminId,
        },
      }),
      prisma.usuario.update({
        where: { id: beneficiarioId },
        data: {
          puntosTotales: {
            increment: puntos,
          },
        },
      }),
    ]);

    res.json({
      message: "Puntos asignados correctamente.",
      usuario: updatedUsuario,
    });
  } catch (error) {
    console.error("Error al asignar puntos:", error);
    res.status(500).json({ message: "Error interno al asignar puntos." });
  }
};

// Obtener perfil del usuario logueado
const getPerfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.userId },
      include: {
        cargo: { select: { nombre: true } },
        centroDeCostos: { select: { nombre: true } },
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const { contrasena, ...perfilSeguro } = usuario;
    res.json(perfilSeguro);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener el perfil." });
  }
};

// Obtener lista de usuarios (admin)
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: "Empleado",
      },
      select: {
        id: true,
        cedula: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        puntosTotales: true,
        activo: true,
        cargo: { select: { nombre: true } },
        centroDeCostos: { select: { nombre: true } },
      },
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios para admin:", error);
    res.status(500).json({ message: "Error al obtener la lista de usuarios." });
  }
};

// Obtener usuario por ID (admin)
const getUsuario = async (req, res) => {
  const usuarioId = parseInt(req.params.id);

  if (isNaN(usuarioId)) {
    return res
      .status(400)
      .json({ message: "El ID del usuario debe ser un número." });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        cargo: { select: { nombre: true } },
        centroDeCostos: { select: { nombre: true } },
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const { contrasena, ...usuarioSeguro } = usuario;
    res.json(usuarioSeguro);
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${usuarioId}:`, error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Actualizar usuario (admin)
const updateUsuario = async (req, res) => {
  const usuarioId = parseInt(req.params.id);
  const { nombreCompleto, cedula, email, rol, activo } = req.body;

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nombreCompleto,
        cedula,
        email,
        rol,
        activo,
      },
    });

    const { contrasena, ...usuarioSeguro } = usuarioActualizado;
    res.json(usuarioSeguro);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `El campo '${error.meta.target[0]}' ya está en uso.`,
      });
    }
    console.error(`Error al actualizar el usuario con ID ${usuarioId}:`, error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar usuario (admin)
const deleteUsuario = async (req, res) => {
  const usuarioId = parseInt(req.params.id);

  try {
    if (usuarioId === req.usuario.userId) {
      return res.status(400).json({
        message: "No puedes eliminar tu propia cuenta de administrador.",
      });
    }

    await prisma.usuario.delete({
      where: { id: usuarioId },
    });

    res.status(204).send();
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${usuarioId}:`, error);
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
};

module.exports = {
  createUsuario,
  loginUsuario,
  asignarPuntos,
  getPerfil,
  getUsuarios,
  getUsuario,
  updateUsuario,
  deleteUsuario,
};
