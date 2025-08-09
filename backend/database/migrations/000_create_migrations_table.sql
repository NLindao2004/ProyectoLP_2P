USE terraverde_db;

-- Tabla para controlar qué migraciones ya se ejecutaron
CREATE TABLE IF NOT EXISTS migrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    migration VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrar las migraciones que ya ejecutaste manualmente
INSERT IGNORE INTO migrations (migration) VALUES
('001_create_tables.sql'),
('001_species_data.sql');