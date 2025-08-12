require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const ProductosRoutes = require("./routes/ProductosRouter");
const CategoriasRoutes = require('./routes/CategoriasRouter');
const adminMiddleware = require('./middleware/adminMiddleware');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // Para JSON
app.use(express.urlencoded({ extended: true })); // Por si mandas formularios

// Servir archivos estáticos (para las imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rutas ---
app.use("/api/productos", ProductosRoutes);
app.use("/api/categorias", CategoriasRoutes);


// --- RUTAS DE LA APLICACIÓN ---

/**
 * Endpoint para CREAR un nuevo usuario (Registro)
 * Incluye la lógica para crear el centro de costos si no existe.
 */
// backend/index.js

/**
 * Endpoint para CREAR un nuevo usuario (Registro)
 * Incluye la lógica para crear el centro de costos y el cargo si no existen.
 */
app.post('/usuarios', async (req, res) => {
  // 1. Extraemos los datos del cuerpo de la petición
  const { cedula, nombreCompleto, cargoNombre, sede, email, contrasena, rol, centroDeCostosNombre } = req.body;

  try {
    // 2. Validar que los datos necesarios están presentes
    if (!email || !contrasena || !cedula || !nombreCompleto || !cargoNombre || !sede || !centroDeCostosNombre) {
      return res.status(400).json({ message: "Todos los campos, incluido el centro de costos y el cargo, son requeridos." });
    }
    
    // 3. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // 4. Lógica para encontrar o crear el centro de costos
    const centroDeCostos = await prisma.centroDeCostos.upsert({
      where: { nombre: centroDeCostosNombre },
      update: {},
      create: { nombre: centroDeCostosNombre },
    });

    // 5. LÓGICA PARA ENCONTRAR O CREAR EL CARGO
    const cargo = await prisma.cargo.upsert({
      where: { nombre: cargoNombre },
      update: {},
      create: { nombre: cargoNombre },
    });

    // 6. Crear el nuevo usuario en la base de datos (USANDO el 'cargo' que acabamos de definir)
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombreCompleto,
        sede,
        email,
        contrasena: hashedPassword,
        rol,
        centroDeCostos: { connect: { id: centroDeCostos.id } },
        cargo: { connect: { id: cargo.id } }, // Conectamos usando el ID del cargo
      },
    });

    // 7. Devolvemos el usuario creado (sin la contraseña)
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
/**
 * Endpoint para INICIAR SESIÓN (Login)
 * Devuelve un token JWT si las credenciales son correctas.
 */
app.post('/auth/login', async (req, res) => {
  const { cedula, contrasena } = req.body;

  try {
    // 1. Validar que envíen los datos
    if (!cedula || !contrasena) {
      return res.status(400).json({ message: 'La cédula y la contraseña son requeridas.' });
    }

    // 2. Buscar al usuario en la base de datos por su cédula
    const usuario = await prisma.usuario.findUnique({
      where: { cedula },
    });

    // 3. Si el usuario no existe O la contraseña es incorrecta, enviar un error
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 4. Si las credenciales son correctas, crear el payload para el Token
    //    Este payload es el que se decodifica en el middleware
    const payload = {
        userId: usuario.id,
        rol: usuario.rol,
        nombre: usuario.nombreCompleto
    };

    // 5. Firmar el token con el secreto y definir una expiración
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '8h',
    });

    // 6. Enviar el token al cliente
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
// backend/index.js

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No se proveyó un token.' });
  }

  // 👇 EL CAMBIO ESTÁ AQUÍ 👇
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido.' });
    }
    
    // Guardamos el payload decodificado en req.usuario
    req.usuario = decodedPayload;
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
        cargo: true,
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
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      // Opcional: Incluir el nombre del centro de costos en la respuesta
      include: {
        centroDeCostos: {
          select: {
            nombre: true
          }
        }
      }
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener los usuarios.' });
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