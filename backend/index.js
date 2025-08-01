require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// --- INICIALIZACIONES ---
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // Para que Express entienda JSON en el body

// --- RUTAS DE LA APLICACIÓN ---

/**
 * Endpoint para CREAR un nuevo usuario (Registro)
 * Incluye la lógica para crear el centro de costos si no existe.
 */
app.post('/usuarios', async (req, res) => {
  // Extraemos todos los datos necesarios del cuerpo de la petición
  const { cedula, nombreCompleto, cargo, sede, email, contrasena, rol, centroDeCostosNombre } = req.body;

  try {
    // Validar que los datos necesarios están presentes
    if (!email || !contrasena || !cedula || !nombreCompleto || !cargo || !sede || !centroDeCostosNombre) {
      return res.status(400).json({ message: "Todos los campos, incluido el centro de costos, son requeridos." });
    }
    
    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Lógica para encontrar o crear el centro de costos
    const centroDeCostos = await prisma.centroDeCostos.upsert({
      where: { nombre: centroDeCostosNombre },
      update: {}, // Si ya existe, no hacemos nada
      create: { nombre: centroDeCostosNombre }, // Si no existe, lo creamos
    });

    // Crear el nuevo usuario en la base de datos
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombreCompleto,
        cargo,
        sede,
        email,
        contrasena: hashedPassword,
        rol,
            centroDeCostos: {
      connect: {
        id: centroDeCostos.id, // Conéctate a un centro de costos con este ID
      },
    },
  },
    });

    // Devolvemos el usuario creado (excluyendo la contraseña por seguridad)
    const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;
    res.status(201).json(usuarioSinContrasena);

  } catch (error) {
    // Manejar error de campos únicos (email o cédula duplicados)
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


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});