const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const adjustDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset);
};

const getCampanas = async (req, res) => {
  try {
    const campanas = await prisma.campana.findMany({
      orderBy: { fechaCreacion: 'desc' },
      include: { productos: true }
    });
    res.json(campanas);
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    res.status(500).json({ error: 'Error al obtener campañas' });
  }
};

const getCampanaById = async (req, res) => {
  const { id } = req.params;
  try {
    const campana = await prisma.campana.findUnique({
      where: { id: parseInt(id) },
      include: { productos: true }
    });
    if (!campana) {
      return res.status(404).json({ message: "Campaña no encontrada" });
    }
    res.json(campana);
  } catch (error) {
    console.error(`Error al obtener la campaña ${id}:`, error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


const createCampana = async (req, res) => {
  try {
    const { titulo, descripcion, fechaInicio, fechaFin, aprobada: aprobadaStr, productosIds } = req.body;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!titulo || !fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Título, fecha de inicio y fecha de fin son obligatorios' });
    }
    
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
      puntos: null, 
      descuento: null, 
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
    res.status(500).json({ error: 'Error al crear campaña' });
  }
};

const updateCampana = async (req, res) => {
  try {
    const { id } = req.params;
    const campanaExistente = await prisma.campana.findUnique({
      where: { id: parseInt(id) }
    });
    if (!campanaExistente) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    
    const { titulo, descripcion, fechaInicio, fechaFin, aprobada: aprobadaStr, productosIds } = req.body;

    const dataUpdate = {
      titulo: titulo ? titulo.trim() : campanaExistente.titulo,
      descripcion: descripcion ? descripcion.trim() : campanaExistente.descripcion,
      aprobada: aprobadaStr !== undefined ? (aprobadaStr === 'true') : campanaExistente.aprobada,
    };

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
    res.status(500).json({ error: 'Error al actualizar campaña' });
  }
};

const toggleEstadoCampana = async (req, res) => {
  try {
    const { id } = req.params;
    const campana = await prisma.campana.findUnique({
      where: { id: parseInt(id) },
    });

    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const campanaActualizada = await prisma.campana.update({
      where: { id: parseInt(id) },
      data: { aprobada: !campana.aprobada },
    });

    res.json({
      message: `Campaña ${campanaActualizada.aprobada ? 'activada' : 'desactivada'} correctamente`,
      campana: campanaActualizada,
    });
  } catch (error) {
    console.error('Error al cambiar el estado de la campaña:', error);
    res.status(500).json({ error: 'Error al cambiar el estado de la campaña' });
  }
};

const asignarProducto = async (req, res) => {
  try {
    const { campanaId, productoId } = req.body;
    if (!campanaId || !productoId) {
      return res.status(400).json({ error: 'campanaId y productoId son obligatorios' });
    }
    const campana = await prisma.campana.update({
      where: { id: parseInt(campanaId) },
      data: { productos: { connect: { id: parseInt(productoId) }}},
      include: { productos: true }
    });
    res.json(campana);
  } catch (error) {
    console.error('Error al asignar producto:', error);
    res.status(500).json({ error: 'Error al asignar producto a campaña' });
  }
};

const quitarProducto = async (req, res) => {
  try {
    const { campanaId, productoId } = req.body;
    if (!campanaId || !productoId) {
      return res.status(400).json({ error: 'campanaId y productoId son obligatorios' });
    }
    const campana = await prisma.campana.update({
      where: { id: parseInt(campanaId) },
      data: { productos: { disconnect: { id: parseInt(productoId) }}},
      include: { productos: true }
    });
    res.json(campana);
  } catch (error) {
    console.error('Error al quitar producto:', error);
    res.status(500).json({ error: 'Error al quitar producto de campaña' });
  }
};

module.exports = {
  getCampanas,
  getCampanaById,
  createCampana,
  updateCampana,
  asignarProducto,
  quitarProducto,
  toggleEstadoCampana, 
};