const request = require('supertest');
const express = require('express');

jest.mock('../config/prisma', () => ({
  categoria: { findMany: jest.fn() }
}));

const prisma = require('../config/prisma');
const CategoriasRouter = require('../routes/CategoriasRouter');

describe('GET /api/categorias', () => {
  it('devuelve lista de categorias', async () => {
    const mockCategorias = [{ id: 1, nombre: 'cat1' }];
    prisma.categoria.findMany.mockResolvedValue(mockCategorias);

    const app = express();
    app.use('/api/categorias', CategoriasRouter);

    const res = await request(app).get('/api/categorias');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockCategorias);
    expect(prisma.categoria.findMany).toHaveBeenCalled();
  });
});
