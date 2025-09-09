// backend/utils/validationSchemas.js
const { z } = require('zod');

// Esquema para la creación de un nuevo usuario
exports.createUserSchema = z.object({
    body: z.object({
        nombreCompleto: z.string({ required_error: 'El nombre completo es requerido.' })
                       .min(3, 'El nombre debe tener al menos 3 caracteres.'),

        cedula: z.string({ required_error: 'La cédula es requerida.' })
                 .regex(/^[0-9]+$/, 'La cédula solo debe contener números.')
                 .min(5, 'La cédula debe tener al menos 5 dígitos.'),

        email: z.string({ required_error: 'El email es requerido.' })
                .email('El formato del email no es válido.'),

        contrasena: z.string({ required_error: 'La contraseña es requerida.' })
                    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),

        sede: z.string({ required_error: 'La sede es requerida.' }),

        rol: z.enum(['Empleado', 'Administrador'], { errorMap: () => ({ message: "El rol debe ser 'Empleado' o 'Administrador'." }) }),

        cargoId: z.number({ required_error: 'El ID del cargo es requerido.', invalid_type_error: 'El ID del cargo debe ser un número.' }),

        centroDeCostosId: z.number({ required_error: 'El ID del centro de costos es requerido.', invalid_type_error: 'El ID del centro de costos debe ser un número.' })
    })
});