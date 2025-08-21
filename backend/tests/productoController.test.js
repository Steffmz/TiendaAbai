const request = require('supertest');
const express = require('express');

jest.mock('../config/prisma', () => ({
  producto: { findMany: jest.fn() }
}));

const prisma = require('../config/prisma');
const ProductosRouter = require('../routes/ProductosRouter');

describe('GET /api/productos', () => {
  it('devuelve lista de productos', async () => {
    const mockProductos = [{ id: 1, nombre: 'prod1', categoriaId: 2 }];
    prisma.producto.findMany.mockResolvedValue(mockProductos);

    const app = express();
    app.use('/api/productos', ProductosRouter);

    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProductos);
    expect(prisma.producto.findMany).toHaveBeenCalled();
  });
});
