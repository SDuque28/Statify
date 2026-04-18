CREATE DATABASE IF NOT EXISTS `statify_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `statify_db`;

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
)

