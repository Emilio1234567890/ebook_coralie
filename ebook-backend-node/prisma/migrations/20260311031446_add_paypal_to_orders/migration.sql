/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - A unique constraint covering the columns `[paypalOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropIndex
DROP INDEX `Order_productId_createdAt_idx` ON `Order`;

-- DropIndex
DROP INDEX `Order_status_createdAt_idx` ON `Order`;

-- DropIndex
DROP INDEX `Order_stripeCheckoutSessionId_key` ON `Order`;

-- DropIndex
DROP INDEX `Order_userId_createdAt_idx` ON `Order`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `updatedAt`,
    ADD COLUMN `paymentProvider` VARCHAR(191) NULL,
    ADD COLUMN `paypalCaptureId` VARCHAR(191) NULL,
    ADD COLUMN `paypalOrderId` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL,
    ALTER COLUMN `currency` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Order_paypalOrderId_key` ON `Order`(`paypalOrderId`);

-- AddForeignKey
ALTER TABLE `Entitlement` ADD CONSTRAINT `Entitlement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Entitlement` ADD CONSTRAINT `Entitlement_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
