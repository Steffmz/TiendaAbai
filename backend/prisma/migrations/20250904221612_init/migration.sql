-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cedula` VARCHAR(15) NOT NULL,
    `nombreCompleto` VARCHAR(191) NOT NULL,
    `sede` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contrasena` VARCHAR(191) NOT NULL,
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `rol` ENUM('Empleado', 'Administrador') NOT NULL DEFAULT 'Empleado',
    `puntosTotales` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fechaRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `centroDeCostosId` INTEGER NOT NULL,
    `cargoId` INTEGER NOT NULL,

    UNIQUE INDEX `usuarios_cedula_key`(`cedula`),
    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `usuarios_passwordResetToken_key`(`passwordResetToken`),
    INDEX `usuarios_cargoId_fkey`(`cargoId`),
    INDEX `usuarios_centroDeCostosId_fkey`(`centroDeCostosId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `imagenUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `categorias_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `precioPuntos` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `imagenUrl` VARCHAR(191) NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `categoriaId` INTEGER NOT NULL,

    INDEX `productos_categoriaId_fkey`(`categoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campanas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `fechaInicio` DATE NOT NULL,
    `fechaFin` DATE NOT NULL,
    `imagenUrl` VARCHAR(191) NULL,
    `aprobada` BOOLEAN NOT NULL DEFAULT false,
    `puntos` INTEGER NULL,
    `descuento` INTEGER NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carrito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cantidad` INTEGER NOT NULL,
    `fechaAgregado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,

    INDEX `carrito_productoId_fkey`(`productoId`),
    UNIQUE INDEX `carrito_usuarioId_productoId_key`(`usuarioId`, `productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_puntos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `puntos` INTEGER NOT NULL,
    `tipo` ENUM('ACUMULACION', 'CANJE', 'ASIGNACION_MANUAL', 'AJUSTE', 'EXPIRACION') NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `origenId` INTEGER NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `adminCreadorId` INTEGER NULL,
    `beneficiarioId` INTEGER NOT NULL,

    INDEX `historial_puntos_adminCreadorId_fkey`(`adminCreadorId`),
    INDEX `historial_puntos_beneficiarioId_fkey`(`beneficiarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('Pendiente', 'RequiereAprobacion', 'Aprobado', 'Enviado', 'Entregado', 'Cancelado', 'Rechazado') NOT NULL DEFAULT 'Pendiente',
    `totalPuntos` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `aprobadoPorAdminId` INTEGER NULL,
    `comentarioAdmin` TEXT NULL,
    `fechaAprobacion` DATETIME(3) NULL,

    INDEX `pedido_aprobadoPorAdminId_fkey`(`aprobadoPorAdminId`),
    INDEX `pedido_usuarioId_fkey`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido_detalle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cantidad` INTEGER NOT NULL,
    `puntosUnitarios` INTEGER NOT NULL,
    `pedidoId` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,

    INDEX `pedido_detalle_pedidoId_fkey`(`pedidoId`),
    INDEX `pedido_detalle_productoId_fkey`(`productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `mensaje` TEXT NOT NULL,
    `leido` BOOLEAN NOT NULL DEFAULT false,
    `fechaEnvio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `pedidoId` INTEGER NULL,

    INDEX `notificaciones_pedidoId_fkey`(`pedidoId`),
    INDEX `notificaciones_usuarioId_fkey`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `centros_de_costos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(20) NULL,

    UNIQUE INDEX `centros_de_costos_nombre_key`(`nombre`),
    UNIQUE INDEX `centros_de_costos_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cargos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `cargos_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_campanatoproducto` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_campanatoproducto_AB_unique`(`A`, `B`),
    INDEX `_campanatoproducto_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `cargos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_centroDeCostosId_fkey` FOREIGN KEY (`centroDeCostosId`) REFERENCES `centros_de_costos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carrito` ADD CONSTRAINT `carrito_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carrito` ADD CONSTRAINT `carrito_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_puntos` ADD CONSTRAINT `historial_puntos_adminCreadorId_fkey` FOREIGN KEY (`adminCreadorId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_puntos` ADD CONSTRAINT `historial_puntos_beneficiarioId_fkey` FOREIGN KEY (`beneficiarioId`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_aprobadoPorAdminId_fkey` FOREIGN KEY (`aprobadoPorAdminId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_detalle` ADD CONSTRAINT `pedido_detalle_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_detalle` ADD CONSTRAINT `pedido_detalle_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedido`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_campanatoproducto` ADD CONSTRAINT `_campanatoproducto_A_fkey` FOREIGN KEY (`A`) REFERENCES `campanas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_campanatoproducto` ADD CONSTRAINT `_campanatoproducto_B_fkey` FOREIGN KEY (`B`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
