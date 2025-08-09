-- Datos de ejemplo para la tabla de especies
-- Este script inserta especies de ejemplo para probar el sistema

USE terraverde_db;

-- Insertar datos de ejemplo para probar
INSERT INTO species (scientific_name, common_name, family, genus, species_name, conservation_status, ecosystem_type, description, habitat) VALUES
('Pharomachrus mocinno', 'Quetzal', 'Trogonidae', 'Pharomachrus', 'mocinno', 'NT', 'terrestre', 'Ave tropical de gran belleza con plumas iridiscentes', 'Bosques nublados de montaña'),
('Dendrobates auratus', 'Rana Dorada', 'Dendrobatidae', 'Dendrobates', 'auratus', 'VU', 'hibrido', 'Pequeña rana venenosa de colores brillantes', 'Selvas húmedas tropicales'),
('Panthera onca', 'Jaguar', 'Felidae', 'Panthera', 'onca', 'EN', 'terrestre', 'Felino más grande de América', 'Selvas tropicales y bosques'),
('Cecropia peltata', 'Cecropia', 'Urticaceae', 'Cecropia', 'peltata', 'LC', 'terrestre', 'Árbol tropical de crecimiento rápido', 'Bosques secundarios y riberas');

-- Insertar algunos avistamientos de ejemplo
INSERT INTO sightings (species_id, latitude, longitude, location_name, region, observer_name, observer_email, observation_date, notes) VALUES
(1, -0.2298500, -78.5249500, 'Bosque Protector Mindo-Nambillo', 'Pichincha', 'Carlos Mendez', 'carlos.mendez@email.com', '2024-01-15', 'Quetzal macho observado alimentándose en aguacatillo'),
(2, -0.6331502, -76.6516515, 'Reserva Cuyabeno', 'Sucumbíos', 'Ana Rodriguez', 'ana.rodriguez@email.com', '2024-01-20', 'Rana dorada encontrada cerca del río, muy activa'),
(3, -1.8312500, -78.1834500, 'Parque Nacional Sangay', 'Morona Santiago', 'Luis Torres', 'luis.torres@email.com', '2024-02-01', 'Huellas de jaguar encontradas cerca del río'),
(4, -0.2298500, -78.5249500, 'Mindo', 'Pichincha', 'María González', 'maria.gonzalez@email.com', '2024-02-05', 'Cecropia joven de aproximadamente 3 metros');