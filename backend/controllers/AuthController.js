// backend/controllers/AuthController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

/**
 * Endpoint para REGISTRAR un nuevo usuario.
 * Incluye la lógica para crear el centro de costos y el cargo si no existen.
 */
const register = async (req, res) => {
    const { cedula, nombreCompleto, cargo, sede, email, contrasena, centroDeCostosNombre } = req.body;

    try {
        if (!email || !contrasena || !cedula || !nombreCompleto || !cargo || !sede || !centroDeCostosNombre) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }
        
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const [cargoRecord, centroDeCostosRecord] = await prisma.$transaction([
            prisma.cargos.upsert({
                where: { nombre: cargo },
                update: {},
                create: { nombre: cargo },
            }),
            prisma.centroDeCostos.upsert({
                where: { nombre: centroDeCostosNombre },
                update: {},
                create: { nombre: centroDeCostosNombre },
            })
        ]);
        
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                cedula,
                nombreCompleto,
                sede,
                email,
                contrasena: hashedPassword,
                rol: 'Empleado', // Rol por defecto
                cargoId: cargoRecord.id,
                centroDeCostosId: centroDeCostosRecord.id,
            },
        });

        const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;
        res.status(201).json(usuarioSinContrasena);

    } catch (error) {
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0];
            return res.status(409).json({ message: `El campo '${field}' ya está en uso.` });
        }
        console.error("Error al crear usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear el usuario.' });
    }
};

/**
 * Endpoint para INICIAR SESIÓN.
 * Devuelve un token JWT si las credenciales son correctas.
 */
const login = async (req, res) => {
    const { cedula, contrasena } = req.body;

    try {
        if (!cedula || !contrasena) {
            return res.status(400).json({ message: 'La cédula y la contraseña son requeridas.' });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { cedula },
        });

        if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const payload = {
            userId: usuario.id,
            rol: usuario.rol,
            nombre: usuario.nombreCompleto
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h',
        });

        res.json({ 
            message: 'Inicio de sesión exitoso',
            token: token 
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    register,
    login
};