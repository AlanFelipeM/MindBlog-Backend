-- ==========================================================
-- MindBlog - Dump do Banco de Dados MySQL (TiDB Cloud)
-- Case Estágio Dev 2026 - Mind Group / Mind Consulting
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `mindblog` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mindblog`;

-- --------------------------------------------------------
-- Estrutura da Tabela `User`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Article`;
DROP TABLE IF EXISTS `User`;

CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Estrutura da Tabela `Article`
-- --------------------------------------------------------
CREATE TABLE `Article` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `bannerImage` LONGBLOB NULL,
  `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `authorId` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `Article_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dados Iniciais de Demonstração (Usuário Admin)
-- Senha cadastrada: '123456' (criptografada em Bcrypt com salt)
-- --------------------------------------------------------
INSERT INTO `User` (`id`, `name`, `email`, `password`) VALUES
(1, 'Mind Admin', 'admin@mindgroup.com.br', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW');

-- --------------------------------------------------------
-- Dados Iniciais de Demonstração (Artigos)
-- --------------------------------------------------------
INSERT INTO `Article` (`id`, `title`, `content`, `publishedAt`, `updatedAt`, `authorId`) VALUES
(1, 'Arquitetura Moderna com React e Express', 'Neste artigo exploramos os fundamentos de uma arquitetura limpa desacoplada utilizando React no Frontend e Express no Backend...', NOW(), NOW(), 1),
(2, 'Boas Práticas de Segurança em APIs RESTful', 'Descubra como o uso de JWT e Bcrypt protege dados confidenciais e previne vulnerabilidades em aplicações Node.js...', NOW(), NOW(), 1);
