/*
  Warnings:

  - You are about to alter the column `status` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[userId,productId]` on the table `Entitlement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('pending', 'paid', 'refunded', 'canceled') NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX `Entitlement_active_idx` ON `Entitlement`(`active`);

-- CreateIndex
CREATE INDEX `Entitlement_userId_active_idx` ON `Entitlement`(`userId`, `active`);

-- CreateIndex
CREATE UNIQUE INDEX `uniq_entitlement_user_product` ON `Entitlement`(`userId`, `productId`);

-- CreateIndex
CREATE INDEX `Order_userId_createdAt_idx` ON `Order`(`userId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Order_productId_createdAt_idx` ON `Order`(`productId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Order_status_createdAt_idx` ON `Order`(`status`, `createdAt`);

-- RenameIndex
ALTER TABLE `Entitlement` RENAME INDEX `Entitlement_orderId_fkey` TO `Entitlement_orderId_idx`;
