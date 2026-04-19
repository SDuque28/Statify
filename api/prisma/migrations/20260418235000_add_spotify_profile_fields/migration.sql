-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `spotifyAccountId` VARCHAR(191) NULL,
    ADD COLUMN `spotifyDisplayName` VARCHAR(191) NULL,
    ADD COLUMN `spotifyEmail` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_spotifyAccountId_key` ON `User`(`spotifyAccountId`);
