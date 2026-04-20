ALTER TABLE `User`
  ADD COLUMN `passwordResetTokenHash` VARCHAR(191) NULL,
  ADD COLUMN `passwordResetExpiresAt` DATETIME(3) NULL;
