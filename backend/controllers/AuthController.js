// backend/controllers/AuthController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
        res.status(500).json({ message: 'No se pudo crear el usuario', details: error.message });
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
        res.status(500).json({ message: 'No se pudo iniciar sesión', details: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
            // No revelamos si el usuario existe o no por seguridad
            return res.status(200).json({ message: 'Si existe una cuenta con este correo, recibirás un enlace para reestablecer tu contraseña.' });
        }

        // Generar un token de reseteo seguro
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // El token expira en 10 minutos
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.usuario.update({
            where: { email },
            data: { passwordResetToken, passwordResetExpires },
        });

        // --- SIMULACIÓN DE ENVÍO DE CORREO ---
        // En un proyecto real, configurarías nodemailer con un servicio como Gmail, SendGrid, etc.
        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        
        console.log('--- ENLACE PARA REESTABLECER CONTRASEÑA ---');
        console.log(`Copia y pega este enlace en tu navegador: ${resetURL}`);
        console.log('-------------------------------------------');
        // Aquí iría la lógica de nodemailer para enviar el email.
        
        res.status(200).json({ message: 'Si existe una cuenta con este correo, recibirás un enlace para reestablecer tu contraseña.' });

    } catch (error) {
        console.error("Error en forgotPassword:", error);
        // Limpiamos los tokens si algo sale mal
        await prisma.usuario.update({ where: { email }, data: { passwordResetToken: null, passwordResetExpires: null } });
        res.status(500).json({ message: 'No se pudo procesar la solicitud de recuperación de contraseña', details: error.message });
    }
};

/**
 * Endpoint para reestablecer la contraseña usando el token.
 */
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { contrasena } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const usuario = await prisma.usuario.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { gt: new Date() }, // El token no ha expirado
            },
        });

        if (!usuario) {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                contrasena: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ message: 'No se pudo restablecer la contraseña', details: error.message });
    }
};


module.exports = {
    register,
    login,
    forgotPassword, // <-- AÑADE ESTO
    resetPassword,  // <-- AÑADE ESTO
};