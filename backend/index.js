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
const path = require('path');

// --- INICIALIZACIONES ---
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

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


// --- RUTAS DE LA APLICACIÓN ---

/**
 * Middleware para verificar el token JWT.
 * Protege rutas que requieren que el usuario esté logueado.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "No se proveyó un token." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      return res.status(403).json({ message: "Token no válido." });
    }
    req.usuario = decodedPayload;
    next();
  });
};


// --- RUTAS DE AUTENTICACIÓN Y REGISTRO ---

/**
 * Endpoint para CREAR un nuevo usuario (Registro).
 */
app.post("/usuarios", async (req, res) => {
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
});

/**
 * Endpoint para INICIAR SESIÓN (Login).
 */
app.post("/auth/login", async (req, res) => {
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
});

/**
 * Endpoint de ADMIN para asignar/restar puntos a un usuario.
 */
app.post(
  "/api/admin/usuarios/:id/puntos",
  adminMiddleware,
  async (req, res) => {
    const beneficiarioId = parseInt(req.params.id);
    const { puntos, descripcion } = req.body;
    const adminId = req.usuario.userId; // Obtenemos el ID del admin desde el token

    // 1. Validar la entrada
    if (typeof puntos !== "number" || !descripcion) {
      return res.status(400).json({
        message: "Se requiere un número de puntos y una descripción.",
      });
    }

    try {
      // 2. Ejecutar ambas operaciones como una transacción
      const [_, updatedUsuario] = await prisma.$transaction([
        // a. Crear el registro en el historial
        prisma.historialPuntos.create({
          data: {
            puntos: puntos,
            tipo: "ASIGNACION_MANUAL",
            descripcion: descripcion,
            beneficiarioId: beneficiarioId,
            adminCreadorId: adminId, // Guardamos qué admin hizo la acción
          },
        }),
        // b. Actualizar el total de puntos del usuario
        prisma.usuario.update({
          where: { id: beneficiarioId },
          data: {
            puntosTotales: {
              increment: puntos, // 'increment' maneja sumas y restas (si 'puntos' es negativo)
            },
          },
        }),
      ]);

      // 3. Devolver el usuario actualizado
      res.json({
        message: "Puntos asignados correctamente.",
        usuario: updatedUsuario,
      });
    } catch (error) {
      console.error("Error al asignar puntos:", error);
      res.status(500).json({ message: "Error interno al asignar puntos." });
    }
  }
);

// --- RUTAS PROTEGIDAS ---

/**
 * Endpoint para obtener el perfil del usuario logueado actualmente.
 */
app.get("/api/perfil", authMiddleware, async (req, res) => {
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
});

//...
app.get("/api/admin/usuarios", adminMiddleware, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: "Empleado", // Solo trae los usuarios cuyo rol sea 'Empleado'
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
});


/**
 * Endpoint de ADMIN para OBTENER un solo usuario por su ID.
 */
app.get("/api/admin/usuarios/:id", adminMiddleware, async (req, res) => {
  // 1. Obtenemos el ID del usuario desde los parámetros de la URL
  const usuarioId = parseInt(req.params.id);

  // Verificamos que el ID sea un número válido
  if (isNaN(usuarioId)) {
    return res
      .status(400)
      .json({ message: "El ID del usuario debe ser un número." });
  }

  try {
    // 2. Buscamos al usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      // 3. Incluimos los nombres de las tablas relacionadas
      include: {
        cargo: {
          select: { nombre: true },
        },
        centroDeCostos: {
          select: { nombre: true },
        },
      },
    });

    // 4. Si no se encuentra el usuario, devolvemos un error 404
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // 5. Excluimos la contraseña antes de enviar la respuesta
    const { contrasena, ...usuarioSeguro } = usuario;
    res.json(usuarioSeguro);
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${usuarioId}:`, error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

/**
 * Endpoint de ADMIN para ACTUALIZAR un usuario existente
 */
app.put("/api/admin/usuarios/:id", adminMiddleware, async (req, res) => {
  const usuarioId = parseInt(req.params.id);
  // Obtenemos los datos que se pueden modificar desde el body
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

    // Excluimos la contraseña antes de devolver la respuesta
    const { contrasena, ...usuarioSeguro } = usuarioActualizado;
    res.json(usuarioSeguro);
  } catch (error) {
    // Manejar error si la cédula o email ya existen en otro usuario
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `El campo '${error.meta.target[0]}' ya está en uso.`,
      });
    }
    console.error(`Error al actualizar el usuario con ID ${usuarioId}:`, error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

/**
 * Endpoint de ADMIN para ELIMINAR un usuario
 */
app.delete("/api/admin/usuarios/:id", adminMiddleware, async (req, res) => {
  const usuarioId = parseInt(req.params.id);

  try {
    if (usuarioId === req.usuario.userId) {
      return res
        .status(400)
        .json({
          message: "No puedes eliminar tu propia cuenta de administrador.",
        });
    }

    await prisma.usuario.delete({
      where: { id: usuarioId },
    });

    res.status(204).send(); // Éxito, sin contenido que devolver
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${usuarioId}:`, error);
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
});

app.get("/api/categorias", async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { activo: true },
    });
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener las categorías." });
  }
});
/**
 * Endpoint de ADMIN para ACTUALIZAR un producto existente
 */
app.put("/api/admin/productos/:id", adminMiddleware, async (req, res) => {
  const productId = parseInt(req.params.id);
  const { nombre, descripcion, precioPuntos, stock, categoriaId } = req.body;

  try {
    const productoActualizado = await prisma.producto.update({
      where: { id: productId },
      data: {
        nombre,
        descripcion,
        precioPuntos: parseInt(precioPuntos),
        stock: parseInt(stock),
        categoriaId: parseInt(categoriaId),
      },
    });
    res.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto." });
  }
});

/**
 * Endpoint de ADMIN para ELIMINAR un producto
 */
app.delete("/api/admin/productos/:id", adminMiddleware, async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    await prisma.producto.delete({
      where: { id: productId },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ message: "Error al eliminar el producto." });
  }
});

/**
 * Endpoint PÚBLICO para OBTENER un solo producto por su ID
 */
app.get("/api/productos/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: productId },
    });
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json(producto);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ message: "Error al obtener el producto." });
  }
});

/**
 * Endpoint de ADMIN para CREAR un nuevo producto
 */
app.post("/api/admin/productos", adminMiddleware, async (req, res) => {
  const { nombre, descripcion, precioPuntos, stock, categoriaId } = req.body;

  try {
    // Validamos que los datos numéricos sean correctos
    if (
      isNaN(parseInt(precioPuntos)) ||
      isNaN(parseInt(stock)) ||
      isNaN(parseInt(categoriaId))
    ) {
      return res.status(400).json({
        message: "Precio, stock y categoría deben ser números válidos.",
      });
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precioPuntos: parseInt(precioPuntos),
        stock: parseInt(stock),
        categoriaId: parseInt(categoriaId),
      },
    });
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ message: "Error al crear el producto." });
  }
});

/**
 * Endpoint para obtener todos los productos del catálogo.
 */
app.get("/api/productos", async (req, res) => {
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
    res.status(500).json({ message: "Error al obtener los productos." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
