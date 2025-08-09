-- Migración: insert_more_example_data
-- Creada: 2025-08-09 05:59:53

USE terraverde_db;

-- Insertar más datos de prueba en example_test
INSERT INTO example_test (name, description) VALUES
('Migración 2', 'Segunda migración ejecutada correctamente'),
('Datos nuevos', 'Estos datos se agregaron en una migración separada'),
('Sistema funcional', 'El sistema de migraciones está trabajando perfectamente'),
('Trabajo en equipo', 'Ahora el equipo puede sincronizar cambios fácilmente');

-- También podemos agregar una nueva columna
ALTER TABLE example_test ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';

-- Actualizar algunos registros existentes
UPDATE example_test SET status = 'inactive' WHERE name = 'Prueba 1';
