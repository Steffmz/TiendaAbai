/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `historial_puntos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `centros_de_costos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `beneficiarioId` to the `historial_puntos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `historial_puntos` DROP FOREIGN KEY `historial_puntos_usuarioId_fkey`;

-- DropIndex
DROP INDEX `centros_de_costos_nombre_key` ON `centros_de_costos`;

-- DropIndex
DROP INDEX `historial_puntos_usuarioId_fkey` ON `historial_puntos`;

-- AlterTable
ALTER TABLE `centros_de_costos` ADD COLUMN `codigo` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `historial_puntos` DROP COLUMN `usuarioId`,
    ADD COLUMN `adminCreadorId` INTEGER NULL,
    ADD COLUMN `beneficiarioId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `centros_de_costos_codigo_key` ON `centros_de_costos`(`codigo`);

-- AddForeignKey
ALTER TABLE `historial_puntos` ADD CONSTRAINT `historial_puntos_beneficiarioId_fkey` FOREIGN KEY (`beneficiarioId`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_puntos` ADD CONSTRAINT `historial_puntos_adminCreadorId_fkey` FOREIGN KEY (`adminCreadorId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
