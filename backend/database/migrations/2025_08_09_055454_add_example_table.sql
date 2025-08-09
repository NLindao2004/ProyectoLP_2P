-- Migración: add_example_table
-- Creada: 2025-08-09 05:54:54

USE terraverde_db;

CREATE TABLE example_test (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO example_test (name, description) VALUES
('Prueba 1', 'Esta es una migración de prueba'),
('Prueba 2', 'El sistema funciona correctamente');