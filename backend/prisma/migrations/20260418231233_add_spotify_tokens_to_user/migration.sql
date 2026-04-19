-- AlterTable
ALTER TABLE `user` ADD COLUMN `spotifyAccessToken` TEXT NULL,
    ADD COLUMN `spotifyConnectedAt` DATETIME(3) NULL,
    ADD COLUMN `spotifyRefreshToken` TEXT NULL,
    ADD COLUMN `spotifyTokenExpiresAt` DATETIME(3) NULL;
