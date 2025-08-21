const request = require('supertest');
const express = require('express');

jest.mock('../config/prisma', () => ({
  usuario: { findUnique: jest.fn() }
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuariosRouter = require('../routes/UsuariosRouter');

describe('POST /auth/login', () => {
  it('devuelve un token cuando las credenciales son válidas', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      contrasena: 'hashed',
      rol: 'Administrador',
      nombreCompleto: 'Admin'
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token123');

    const app = express();
    app.use(express.json());
    app.use('/', UsuariosRouter);

    const res = await request(app)
      .post('/auth/login')
      .send({ cedula: '1', contrasena: 'pwd' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('token123');
    expect(prisma.usuario.findUnique).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalledWith('pwd', 'hashed');
    expect(jwt.sign).toHaveBeenCalled();
  });
});
