require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const ProductosRoutes = require('./routes/ProductosRouter');
const CategoriasRoutes = require('./routes/CategoriasRouter');
const CampanaRouter = require('./routes/CampanaRouter');
const UsuariosRouter = require('./routes/UsuariosRouter');
const CarritoRouter = require('./routes/CarritoRouter');
const PedidoRouter = require('./routes/PedidoRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/', express.static(path.join(__dirname, 'uploads')));

app.use('/api/productos', ProductosRoutes);
app.use('/api/categorias', CategoriasRoutes);
app.use('/api/campanas', CampanaRouter);
app.use('/', UsuariosRouter);
app.use('/api/carrito', CarritoRouter);
app.use('/api/pedidos', PedidoRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
