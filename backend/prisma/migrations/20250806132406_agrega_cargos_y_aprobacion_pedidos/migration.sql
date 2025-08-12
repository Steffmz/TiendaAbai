/*
  Warnings:

  - You are about to drop the column `cargo` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `cargoId` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notificaciones` ADD COLUMN `pedidoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `pedido` ADD COLUMN `aprobadoPorAdminId` INTEGER NULL,
    ADD COLUMN `comentarioAdmin` TEXT NULL,
    ADD COLUMN `fechaAprobacion` DATETIME(3) NULL,
    MODIFY `estado` ENUM('Pendiente', 'RequiereAprobacion', 'Aprobado', 'Enviado', 'Entregado', 'Cancelado', 'Rechazado') NOT NULL DEFAULT 'Pendiente';

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `cargo`,
    ADD COLUMN `cargoId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `cargos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `cargos_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `cargos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_aprobadoPorAdminId_fkey` FOREIGN KEY (`aprobadoPorAdminId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedido`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
