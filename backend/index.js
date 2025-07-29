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