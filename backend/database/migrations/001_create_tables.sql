-- Crear base de datos TerraVerde
-- Este script crea todas las tablas necesarias para el sistema

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS terraverde_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE terraverde_db;

-- Tabla de especies
CREATE TABLE species (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scientific_name VARCHAR(255) NOT NULL UNIQUE,
    common_name VARCHAR(255) NOT NULL,
    family VARCHAR(100),
    genus VARCHAR(100),
    species_name VARCHAR(100),
    conservation_status ENUM('LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD', 'NE') DEFAULT 'NE',
    ecosystem_type ENUM('acuatico', 'terrestre', 'hibrido') NOT NULL,
    description TEXT,
    habitat TEXT,
    distribution_range TEXT,
    image_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_ecosystem (ecosystem_type),
    INDEX idx_conservation (conservation_status),
    INDEX idx_verified (verified)
);

-- Tabla de avistamientos/reportes
CREATE TABLE sightings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    species_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name VARCHAR(255),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Ecuador',
    observer_name VARCHAR(255),
    observer_email VARCHAR(255),
    observation_date DATE NOT NULL,
    observation_time TIME,
    notes TEXT,
    image_url VARCHAR(500),
    weather_conditions VARCHAR(255),
    temperature DECIMAL(4, 2),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    INDEX idx_location (latitude, longitude),
    INDEX idx_date (observation_date),
    INDEX idx_species (species_id),
    INDEX idx_verified (verified)
);

-- Tabla de usuarios (opcional para futuro)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('user', 'researcher', 'admin') DEFAULT 'user',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role)
);