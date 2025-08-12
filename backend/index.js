require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// --- INICIALIZACIONES ---
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (para las imágenes de productos en el futuro)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- MIDDLEWARES DE AUTENTICACIÓN ---

/**
 * Middleware para verificar el token JWT.
 * Protege rutas que requieren que el usuario esté logueado.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'No se proveyó un token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido.' });
    }
    req.usuario = decodedPayload; // Guarda el payload del token (userId, rol, etc.)
    next();
  });
};

/**
 * Middleware para verificar el rol de Administrador.
 * Protege rutas que solo pueden ser accedidas por administradores.
 */
const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No se proveyó un token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido.' });
    }

    if (decodedPayload.rol !== 'Administrador') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }

    req.usuario = decodedPayload;
    next();
  });
};


// --- RUTAS DE AUTENTICACIÓN Y REGISTRO ---

/**
 * Endpoint para CREAR un nuevo usuario (Registro).
 */
app.post('/usuarios', async (req, res) => {
  const { cedula, nombreCompleto, cargoNombre, sede, email, contrasena, rol, centroDeCostosNombre } = req.body;

  try {
    if (!email || !contrasena || !cedula || !nombreCompleto || !cargoNombre || !sede || !centroDeCostosNombre) {
      return res.status(400).json({ message: "Todos los campos, incluido el cargo y el centro de costos, son requeridos." });
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
    if (error.code === 'P2002') {
      return res.status(409).json({ message: `El campo '${error.meta.target[0]}' ya está en uso.` });
    }
    
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: 'Error interno del servidor al crear el usuario.' });
  }
});

/**
 * Endpoint para INICIAR SESIÓN (Login).
 */
app.post('/auth/login', async (req, res) => {
  const { cedula, contrasena } = req.body;

  try {
    if (!cedula || !contrasena) {
      return res.status(400).json({ message: 'La cédula y la contraseña son requeridas.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { cedula } });

    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const payload = {
        userId: usuario.id,
        rol: usuario.rol,
        nombre: usuario.nombreCompleto
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ 
        message: 'Inicio de sesión exitoso',
        token: token 
    });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});


// --- RUTAS PROTEGIDAS ---

/**
 * Endpoint para obtener el perfil del usuario logueado actualmente.
 */
app.get('/api/perfil', authMiddleware, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.userId },
      include: {
        cargo: { select: { nombre: true } },
        centroDeCostos: { select: { nombre: true } },
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const { contrasena, ...perfilSeguro } = usuario;
    res.json(perfilSeguro);
    
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: 'Error al obtener el perfil.' });
  }
});

/**
 * Endpoint para que un admin obtenga la lista de todos los usuarios.
 */
app.get('/api/admin/usuarios', adminMiddleware, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
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
      }
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios para admin:", error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios.' });
  }
});


// --- RUTAS PÚBLICAS ---

/**
 * Endpoint para obtener todos los productos del catálogo.
 */
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        estado: true,
        stock: { gt: 0 },
      },
      include: {
        categoria: { select: { nombre: true } },
      },
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: 'Error al obtener los productos.' });
  }
});


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});