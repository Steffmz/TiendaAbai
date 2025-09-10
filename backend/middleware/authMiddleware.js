// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const {
  UnauthorizedError,
  ForbiddenError,
} = require('../utils/ApiError');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return next(
      new UnauthorizedError('Acceso denegado. No se proveyó un token.')
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Añade los datos del token a la petición
    next(); // Continúa con la siguiente función
  } catch (error) {
    next(new ForbiddenError('Token no válido o expirado.'));
  }
};

module.exports = authMiddleware;