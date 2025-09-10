// backend/middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');
const {
  UnauthorizedError,
  ForbiddenError,
} = require('../utils/ApiError');

const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('No se proveyó un token.'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return next(new ForbiddenError('Token no válido.'));
    }

    // ✅ ¡La verificación clave!
    if (usuario.rol !== 'Administrador') {
      return next(
        new ForbiddenError(
          'Acceso denegado. Se requiere rol de administrador.'
        )
      );
    }

    req.usuario = usuario;
    next();
  });
};

module.exports = adminMiddleware;