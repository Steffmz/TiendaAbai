require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const ProductosRoutes = require('./routes/ProductosRouter');
const CategoriasRoutes = require('./routes/CategoriasRouter');
const CampanaRouter = require('./routes/CampanaRouter');
const adminMiddleware = require('./middleware/adminMiddleware');
const UsuarioRouter = require('./routes/UsuarioRouter');
const PedidoRouter = require('./routes/PedidoRouter');
const CarritoRouter = require('./routes/CarritoRouter');

const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
// ...
const NotificacionRouter = require('./routes/NotificacionRouter');
// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (para las imágenes)
app.use('/uploads/', express.static(path.join(__dirname, 'uploads')));

// --- Rutas ---
app.use('/api/productos', ProductosRoutes);
app.use("/api/categorias", CategoriasRoutes);
app.use('/api/campanas', CampanaRouter);
app.use('/api/usuarios', UsuarioRouter);
app.use('/api/pedidos', PedidoRouter);
app.use('/api/notificaciones', NotificacionRouter);
app.use('/api/carrito', CarritoRouter);


// --- RUTAS DE LA APLICACIÓN ---

/**
 * Endpoint para CREAR un nuevo usuario (Registro)
 * Incluye la lógica para crear el centro de costos si no existe.
 */
app.post('/usuarios', async (req, res) => {
  // Extraemos los datos que envía el formulario de registro
  const { cedula, nombreCompleto, cargo, sede, email, contrasena, rol, centroDeCostosNombre } = req.body;

  try {
    // Validar que los datos necesarios están presentes
    if (!email || !contrasena || !cedula || !nombreCompleto || !cargo || !sede || !centroDeCostosNombre) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }
    
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // --- LÓGICA CORREGIDA PARA CARGO Y CENTRO DE COSTOS ---
    // Usamos una transacción de Prisma para asegurar que ambas operaciones (o ninguna) se completen.
    const [cargoRecord, centroDeCostosRecord] = await prisma.$transaction([
      prisma.cargos.upsert({
        where: { nombre: cargo }, // Busca el cargo por nombre
        update: {}, // Si existe, no hace nada
        create: { nombre: cargo }, // Si no existe, lo crea
      }),
      prisma.centroDeCostos.upsert({
        where: { nombre: centroDeCostosNombre },
        update: {},
        create: { nombre: centroDeCostosNombre },
      })
    ]);
    
    // Crear el nuevo usuario usando los IDs obtenidos
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombreCompleto,
        sede,
        email,
        contrasena: hashedPassword,
        rol: rol || 'Empleado', // Asegura un rol por defecto
        // Conectar usando los IDs correctos
        cargoId: cargoRecord.id,
        centroDeCostosId: centroDeCostosRecord.id,
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
 * Endpoint para INICIAR SESIÓN (Login)
 * Devuelve un token JWT si las credenciales son correctas.
 */
app.post('/auth/login', async (req, res) => {
  const { cedula, contrasena } = req.body;

  try {
    // Validar que envíen los datos
    if (!cedula || !contrasena) {
      return res.status(400).json({ message: 'La cédula y la contraseña son requeridas.' });
    }

    // Buscar al usuario en la base de datos por su cédula
    const usuario = await prisma.usuario.findUnique({
      where: { cedula },
    });

    // Si el usuario no existe O la contraseña es incorrecta, enviar un error
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Si las credenciales son correctas, crear el payload para el Token
    const payload = {
        userId: usuario.id,
        rol: usuario.rol,
        nombre: usuario.nombreCompleto
    };

    // Firmar el token con el secreto y definir una expiración
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '8h', // El token expirará en 8 horas
    });

    // Enviar el token al cliente
    res.json({ 
        message: 'Inicio de sesión exitoso',
        token: token 
    });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// backend/index.js

// --- Middleware de Autenticación (Protector de Rutas) ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'No se proveyó un token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido.' });
    }
    req.usuario = usuario;
    next();
  });
};

/*
* Endpoint PROTEGIDO para obtener el perfil del usuario logueado
*/
app.get('/api/perfil', authMiddleware, async (req, res) => {
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
});

/**
 * Endpoint para OBTENER todos los usuarios (para pruebas)
 */
// backend/index.js -> app.post('/usuarios', ...) - CÓDIGO CORREGIDO

app.post('/usuarios', async (req, res) => {
  const { cedula, nombreCompleto, cargo, sede, email, contrasena, rol, centroDeCostosNombre } = req.body;

  try {
    if (!email || !contrasena || !cedula || !nombreCompleto || !cargo || !sede || !centroDeCostosNombre) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }
    
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // --- LÓGICA CORREGIDA PARA CARGO Y CENTRO DE COSTOS ---
    // Usamos una transacción de Prisma para asegurar que ambas operaciones (o ninguna) se completen.
    const [cargoRecord, centroDeCostosRecord] = await prisma.$transaction([
      prisma.cargos.upsert({
        where: { nombre: cargo },
        update: {},
        create: { nombre: cargo },
      }),
      prisma.centroDeCostos.upsert({
        where: { nombre: centroDeCostosNombre },
        update: {},
        create: { nombre: centroDeCostosNombre },
      })
    ]);
    
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombreCompleto,
        sede,
        email,
        contrasena: hashedPassword,
        rol,
        // Conectar usando los IDs obtenidos del upsert
        cargoId: cargoRecord.id,
        centroDeCostosId: centroDeCostosRecord.id,
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

app.get('/api/admin/usuarios', adminMiddleware, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { // Seleccionamos qué campos devolver
        id: true,
        cedula: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        puntosTotales: true,
        activo: true,
        centroDeCostos: {
          select: {
            nombre: true,
          }
        }
      }
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios para admin:", error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios.' });
  }
});


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});