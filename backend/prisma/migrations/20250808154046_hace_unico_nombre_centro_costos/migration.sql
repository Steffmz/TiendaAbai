/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `centros_de_costos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `centros_de_costos_nombre_key` ON `centros_de_costos`(`nombre`);
