const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();
const { InternalServerError } = require('../utils/ApiError');

// FUNCIÓN PARA CORREGIR LA ZONA HORARIA
const adjustDate = (dateString) => {
  if (!dateString) return null;
  // Previene que se ajuste una fecha que ya es un objeto Date
  if (dateString instanceof Date) return dateString;
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset);
};

// Obtener campañas con productos
const getCampanas = async (req, res, next) => {
  try {
    const campanas = await prisma.campana.findMany({
      orderBy: { fechaCreacion: 'desc' },
      include: { productos: true }
    });
    res.json(campanas);
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    next(new InternalServerError('Error al obtener campañas'));
  }
};

const getCampanaById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const campana = await prisma.campana.findUnique({
      where: { id: parseInt(id) },
      include: {
        productos: true
      }
    });

    if (!campana) {
      return res.status(404).json({ message: "Campaña no encontrada" });
    }
    res.json(campana);
  } catch (error) {
    console.error(`Error al obtener la campaña ${id}:`, error);
    next(new InternalServerError('Error interno del servidor.'));
  }
};


// Crear campaña
const createCampana = async (req, res, next) => {
  try {
    const { titulo, descripcion, fechaInicio, fechaFin, aprobada: aprobadaStr, puntos: puntosStr, descuento: descuentoStr, productosIds } = req.body;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!titulo || !fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Título, fecha de inicio y fecha de fin son obligatorios' });
    }
    
    // CORRECCIÓN: Ajustamos las fechas antes de guardarlas
    const fechaInicioDate = adjustDate(fechaInicio);
    const fechaFinDate = adjustDate(fechaFin);

    if (fechaFinDate <= fechaInicioDate) {
      return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
    }

    const dataCampana = {
      titulo: titulo.trim(),
      descripcion: descripcion ? descripcion.trim() : null,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      aprobada: aprobadaStr === 'true',
      puntos: puntosStr ? parseInt(puntosStr) : null,
      descuento: descuentoStr ? parseInt(descuentoStr) : null,
      imagenUrl,
    };

    if (productosIds) {
        dataCampana.productos = {
          connect: JSON.parse(productosIds).map(id => ({ id: parseInt(id) }))
        };
    }

    const nueva = await prisma.campana.create({
      data: dataCampana,
      include: { productos: true }
    });

    res.json(nueva);
  } catch (error) {
    console.error("Error al crear campaña:", error);
    next(new InternalServerError('Error al crear campaña'));
  }
};

// Actualizar campaña
const updateCampana = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campanaExistente = await prisma.campana.findUnique({
      where: { id: parseInt(id) }
    });

    if (!campanaExistente) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    
    const { titulo, descripcion, fechaInicio, fechaFin, aprobada: aprobadaStr, puntos: puntosStr, descuento: descuentoStr, productosIds } = req.body;

    const dataUpdate = {
      titulo: titulo ? titulo.trim() : campanaExistente.titulo,
      descripcion: descripcion ? descripcion.trim() : campanaExistente.descripcion,
      aprobada: aprobadaStr !== undefined ? (aprobadaStr === 'true') : campanaExistente.aprobada,
      puntos: puntosStr ? parseInt(puntosStr) : campanaExistente.puntos,
      descuento: descuentoStr ? parseInt(descuentoStr) : campanaExistente.descuento,
    };

    // CORRECCIÓN: Ajustamos las fechas si se proporcionan
    if (fechaInicio) dataUpdate.fechaInicio = adjustDate(fechaInicio);
    if (fechaFin) dataUpdate.fechaFin = adjustDate(fechaFin);

    if (req.file) {
      if (campanaExistente.imagenUrl) {
        const rutaImagenAnterior = path.join(__dirname, '..', '..', campanaExistente.imagenUrl);
        if (fs.existsSync(rutaImagenAnterior)) fs.unlinkSync(rutaImagenAnterior);
      }
      dataUpdate.imagenUrl = `/uploads/${req.file.filename}`;
    }

    if (productosIds) {
      dataUpdate.productos = {
        set: [], 
        connect: JSON.parse(productosIds).map(id => ({ id: parseInt(id) }))
      };
    }

    const actualizada = await prisma.campana.update({
      where: { id: parseInt(id) },
      data: dataUpdate,
      include: { productos: true }
    });

    res.json(actualizada);
  } catch (error) {
    console.error("Error al actualizar campaña:", error);
    next(new InternalServerError('Error al actualizar campaña'));
  }
};

const deleteCampana = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const campana = await prisma.campana.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    if (campana.imagenUrl) {
      const rutaImagen = path.join(__dirname, '..', '..', campana.imagenUrl);
      if (fs.existsSync(rutaImagen)) fs.unlinkSync(rutaImagen);
    }

    await prisma.campana.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Campaña eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar campaña:', error);
    next(new InternalServerError('Error al eliminar campaña'));
  }
};

const asignarProducto = async (req, res, next) => {
  try {
    const { campanaId, productoId } = req.body;
    if (!campanaId || !productoId) {
      return res.status(400).json({ error: 'campanaId y productoId son obligatorios' });
    }
    const campana = await prisma.campana.update({
      where: { id: parseInt(campanaId) },
      data: {
        productos: {
          connect: { id: parseInt(productoId) }
        }
      },
      include: { productos: true }
    });
    res.json(campana);
  } catch (error) {
    console.error('Error al asignar producto:', error);
    next(new InternalServerError('Error al asignar producto a campaña'));
  }
};

const quitarProducto = async (req, res, next) => {
  try {
    const { campanaId, productoId } = req.body;
    if (!campanaId || !productoId) {
      return res.status(400).json({ error: 'campanaId y productoId son obligatorios' });
    }
    const campana = await prisma.campana.update({
      where: { id: parseInt(campanaId) },
      data: {
        productos: {
          disconnect: { id: parseInt(productoId) }
        }
      },
      include: { productos: true }
    });
    res.json(campana);
  } catch (error) {
    console.error('Error al quitar producto:', error);
    next(new InternalServerError('Error al quitar producto de campaña'));
  }
};

module.exports = {
  getCampanas,
  getCampanaById,
  createCampana,
  updateCampana,
  deleteCampana,
  asignarProducto,
  quitarProducto
};