// backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- IMPORTACIÓN DE RUTAS ---
const AuthRouter = require('./routes/AuthRouter');
const ProductosRoutes = require('./routes/ProductosRouter');
const CategoriasRoutes = require('./routes/CategoriasRouter');
const CampanaRouter = require('./routes/CampanaRouter');
const UsuarioRouter = require('./routes/UsuarioRouter');
const PedidoRouter = require('./routes/PedidoRouter');
const NotificacionRouter = require('./routes/NotificacionRouter');
const CarritoRouter = require('./routes/CarritoRouter');
const PerfilRouter = require('./routes/PerfilRouter');
const HistorialRouter = require('./routes/HistorialRouter');
const AdminDataRouter = require('./routes/AdminDataRouter');
const DashboardRouter = require('./routes/DashboardRouter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (para las imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DEFINICIÓN DE RUTAS DE LA API ---
app.use('/api/auth', AuthRouter); // Rutas para login y registro
app.use('/api/perfil', PerfilRouter); // Ruta para el perfil del usuario logueado
app.use('/api/productos', ProductosRoutes);
app.use('/api/categorias', CategoriasRoutes);
app.use('/api/campanas', CampanaRouter);
app.use('/api/usuarios', UsuarioRouter);
app.use('/api/pedidos', PedidoRouter);
app.use('/api/notificaciones', NotificacionRouter);
app.use('/api/carrito', CarritoRouter);
app.use('/api/historial', HistorialRouter);
app.use('/api/admin-data', AdminDataRouter);
app.use('/api/dashboard', DashboardRouter);

// --- MIDDLEWARE DE MANEJO DE ERRORES ---
app.use(errorHandler);


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});