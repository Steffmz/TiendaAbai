// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); // 1. Importar

const prisma = new PrismaClient(); // 2. Crear instancia
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- RUTAS DE EJEMPLO ---

// Ruta para ver todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany(); // 3. Usar Prisma Client
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
});

// Ruta para crear un producto
app.post('/productos', async (req, res) => {
    try {
        const nuevoProducto = await prisma.producto.create({
            data: req.body, // Asegúrate de que el body coincida con el modelo
        });
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// backend/index.js

// ... (importaciones existentes de express, cors, prisma)
const bcrypt = require('bcryptjs'); // <-- AÑADE ESTA LÍNEA

// ... (código existente de app.use, etc.)

/*
* Endpoint para CREAR un nuevo usuario (Registro)
*/
app.post('/usuarios', async (req, res) => {
  // Extraemos los datos del cuerpo de la petición
  const { cedula, nombreCompleto, cargo, sede, email, contrasena, rol } = req.body;

  try {
    // 1. Validar que los datos necesarios están presentes
    if (!email || !contrasena || !cedula || !nombreCompleto) {
      return res.status(400).json({ message: "La cédula, nombre, email y contraseña son requeridos." });
    }

    // 2. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10); // 10 es el "costo" del hash

    // 3. Crear el usuario en la base de datos con la contraseña encriptada
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        cedula,
        nombreCompleto,
        cargo,
        sede,
        email,
        contrasena: hashedPassword, // Guardamos la contraseña encriptada
        rol, // rol puede ser 'Empleado' o 'Administrador'
      },
    });

    // 4. Devolver el usuario creado (sin la contraseña)
    const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;
    res.status(201).json(usuarioSinContrasena);

  } catch (error) {
    // Manejar errores comunes, como un email o cédula que ya existen
    if (error.code === 'P2002') { // Código de error de Prisma para 'unique constraint violation'
      return res.status(409).json({ message: `El ${error.meta.target[0]} ya está en uso.` });
    }

    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario.' });
  }
});

// ... (tu ruta GET /usuarios y app.listen existentes)

// backend/index.js

// ... (importaciones existentes de express, cors, prisma, bcrypt)
const jwt = require('jsonwebtoken'); // <-- AÑADE ESTA LÍNEA

// ... (código existente)

/*
* Endpoint para INICIAR SESIÓN (Login)
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

    // 3. Si el usuario no existe O la contraseña es incorrecta, enviar el mismo error
    //    Usamos bcrypt.compare para comparar la contraseña enviada con la hasheada en la BD
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 4. Si las credenciales son correctas, crear el Token (JWT)
    const payload = {
        userId: usuario.id,
        rol: usuario.rol,
        nombre: usuario.nombreCompleto
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '8h', // El token expirará en 8 horas
    });

    // 5. Enviar el token al cliente
    res.json({ 
        message: 'Inicio de sesión exitoso',
        token: token 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// ... (tus otras rutas como POST /usuarios, GET /usuarios, etc.)