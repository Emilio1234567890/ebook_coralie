-- DropForeignKey
ALTER TABLE `Entitlement` DROP FOREIGN KEY `Entitlement_userId_fkey`;

-- DropIndex
DROP INDEX `Entitlement_userId_active_idx` ON `Entitlement`;

-- CreateIndex
CREATE INDEX `Entitlement_userId_idx` ON `Entitlement`(`userId`);

-- AddForeignKey
ALTER TABLE `Entitlement` ADD CONSTRAINT `Entitlement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Entitlement` RENAME INDEX `Entitlement_productId_fkey` TO `Entitlement_productId_idx`;

-- RenameIndex
ALTER TABLE `Entitlement` RENAME INDEX `uniq_entitlement_user_product` TO `Entitlement_userId_productId_key`;
