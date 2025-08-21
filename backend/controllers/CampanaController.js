const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

// Obtener campañas con productos
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

// Crear campaña (imagen + productos)
const createCampana = async (req, res) => {
  try {
    console.log('📤 Datos recibidos:', req.body);
    console.log('📤 Archivo recibido:', req.file);

    const titulo = req.body.titulo ? req.body.titulo.trim() : '';
    const descripcion = req.body.descripcion ? req.body.descripcion.trim() : null;
    const fechaInicio = req.body.fechaInicio ? req.body.fechaInicio : '';
    const fechaFin = req.body.fechaFin ? req.body.fechaFin : '';
    const aprobada = req.body.aprobada === 'true' || req.body.aprobada === true;
    const puntos = req.body.puntos && req.body.puntos !== 'null' && req.body.puntos !== '' ? parseInt(req.body.puntos) : null;
    const descuento = req.body.descuento && req.body.descuento !== 'null' && req.body.descuento !== '' ? parseInt(req.body.descuento) : null;
    const productosIds = req.body.productosIds;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!titulo || !fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Título, fechaInicio y fechaFin son obligatorios' });
    }

    // Validar fechas
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
      return res.status(400).json({ error: 'Las fechas no son válidas' });
    }

    // Validar que fecha fin sea mayor a fecha inicio
    if (fechaFinDate <= fechaInicioDate) {
      return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
    }

    const dataCampana = {
      titulo,
      descripcion,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      aprobada,
      puntos,
      descuento
    };

    if (imagenUrl) {
      dataCampana.imagenUrl = imagenUrl;
    }

    if (productosIds) {
      try {
        const idsArray = JSON.parse(productosIds);
        dataCampana.productos = {
          connect: idsArray.map(id => ({ id: parseInt(id) }))
        };
      } catch (parseError) {
        console.error('Error al parsear productosIds:', parseError);
        return res.status(400).json({ error: 'Formato de productos inválido' });
      }
    }

    const nueva = await prisma.campana.create({
      data: dataCampana,
      include: { productos: true }
    });

    console.log('✅ Campaña creada:', nueva);
    res.json(nueva);
  } catch (error) {
    console.error("Error al crear campaña:", error);
    res.status(500).json({ error: 'Error al crear campaña: ' + error.message });
  }
};

// Actualizar campaña (imagen + productos)
const updateCampana = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📤 Actualizando campaña ID:', id);
    console.log('📤 Datos recibidos:', req.body);
    console.log('📤 Archivo recibido:', req.file);

    const campanaExistente = await prisma.campana.findUnique({
      where: { id: parseInt(id) },
      include: { productos: true }
    });

    if (!campanaExistente) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const titulo = req.body.titulo ? req.body.titulo.trim() : campanaExistente.titulo;
    const descripcion = req.body.descripcion ? req.body.descripcion.trim() : campanaExistente.descripcion;
    const fechaInicio = req.body.fechaInicio ? req.body.fechaInicio : campanaExistente.fechaInicio;
    const fechaFin = req.body.fechaFin ? req.body.fechaFin : campanaExistente.fechaFin;
    const aprobada = req.body.aprobada !== undefined ? (req.body.aprobada === 'true' || req.body.aprobada === true) : campanaExistente.aprobada;
    const puntos = req.body.puntos && req.body.puntos !== 'null' && req.body.puntos !== '' ? parseInt(req.body.puntos) : campanaExistente.puntos;
    const descuento = req.body.descuento && req.body.descuento !== 'null' && req.body.descuento !== '' ? parseInt(req.body.descuento) : campanaExistente.descuento;
    const productosIds = req.body.productosIds;

    const dataUpdate = {
      titulo,
      descripcion,
      aprobada,
      puntos,
      descuento
    };

    // Validar y agregar fechas si están presentes
    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio);
      if (isNaN(fechaInicioDate.getTime())) {
        return res.status(400).json({ error: 'La fecha de inicio no es válida' });
      }
      dataUpdate.fechaInicio = fechaInicioDate;
    }

    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin);
      if (isNaN(fechaFinDate.getTime())) {
        return res.status(400).json({ error: 'La fecha de fin no es válida' });
      }
      dataUpdate.fechaFin = fechaFinDate;
    }

    // Manejar nueva imagen
    if (req.file) {
      if (campanaExistente.imagenUrl) {
        const rutaImagenAnterior = path.join(__dirname, '..', '..', campanaExistente.imagenUrl);
        try {
          if (fs.existsSync(rutaImagenAnterior)) {
            fs.unlinkSync(rutaImagenAnterior);
            console.log('🗑️ Imagen anterior eliminada:', rutaImagenAnterior);
          }
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error);
        }
      }
      
      dataUpdate.imagenUrl = `/uploads/${req.file.filename}`;
    }

    // Actualizar productos si se enviaron
    if (productosIds) {
      try {
        const idsArray = JSON.parse(productosIds);
        dataUpdate.productos = {
          set: [], 
          connect: idsArray.map(id => ({ id: parseInt(id) }))
        };
      } catch (parseError) {
        console.error('Error al parsear productosIds:', parseError);
        return res.status(400).json({ error: 'Formato de productos inválido' });
      }
    }

    const actualizada = await prisma.campana.update({
      where: { id: parseInt(id) },
      data: dataUpdate,
      include: { productos: true }
    });

    console.log('✅ Campaña actualizada:', actualizada);
    res.json(actualizada);
  } catch (error) {
    console.error("Error al actualizar campaña:", error);
    res.status(500).json({ error: 'Error al actualizar campaña: ' + error.message });
  }
};

// Eliminar campaña
const deleteCampana = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campana = await prisma.campana.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!campana) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    // Eliminar imagen si existe
    if (campana.imagenUrl) {
      const rutaImagen = path.join(__dirname, '..', '..', campana.imagenUrl);
      try {
        if (fs.existsSync(rutaImagen)) {
          fs.unlinkSync(rutaImagen);
          console.log('🗑️ Imagen eliminada:', rutaImagen);
        }
      } catch (error) {
        console.error('Error al eliminar imagen:', error);
      }
    }

    await prisma.campana.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Campaña eliminada correctamente');
    res.json({ message: 'Campaña eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar campaña:', error);
    res.status(500).json({ error: 'Error al eliminar campaña: ' + error.message });
  }
};

// Asignar producto a campaña 
const asignarProducto = async (req, res) => {
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
    res.status(500).json({ error: 'Error al asignar producto a campaña' });
  }
};

// Quitar producto de campaña (extra)
const quitarProducto = async (req, res) => {
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
    res.status(500).json({ error: 'Error al quitar producto de campaña' });
  }
};

module.exports = {
  getCampanas,
  createCampana,
  updateCampana,
  deleteCampana,
  asignarProducto,
  quitarProducto
};