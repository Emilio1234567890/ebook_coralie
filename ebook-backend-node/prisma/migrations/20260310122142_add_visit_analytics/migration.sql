-- CreateTable
CREATE TABLE `Visit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `countryCode` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `referrer` VARCHAR(191) NULL,
    `ua` VARCHAR(191) NULL,
    `browser` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `device` VARCHAR(191) NULL,
    `ipHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Visit_createdAt_idx`(`createdAt`),
    INDEX `Visit_countryCode_idx`(`countryCode`),
    INDEX `Visit_path_idx`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
