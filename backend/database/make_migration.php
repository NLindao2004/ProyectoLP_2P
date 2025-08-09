<?php
// filepath: c:\Users\Abeni\OneDrive\Documentos\Archivos ESPOL\Septimo Semestre\Lenguajes de Programacion\Proyectos\ProyectoLP_2P\backend\database\make_migration.php

if ($argc < 2) {
    echo "❌ Uso: php make_migration.php nombre_de_la_migracion\n";
    echo "   Ejemplo: php make_migration.php create_ecosystems_table\n";
    exit(1);
}

$migrationName = $argv[1];
$timestamp = date('Y_m_d_His');
$filename = "{$timestamp}_{$migrationName}.sql";
$filepath = __DIR__ . "/migrations/{$filename}";

$template = "-- Migración: {$migrationName}
-- Creada: " . date('Y-m-d H:i:s') . "

USE terraverde_db;

-- TODO: Escribir aquí los cambios de base de datos

-- Ejemplo:
-- CREATE TABLE nueva_tabla (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     nombre VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
";

file_put_contents($filepath, $template);

echo "✅ Migración creada: {$filename}\n";
echo "📝 Edita el archivo: {$filepath}\n";
echo "🚀 Ejecuta con: php migrate.php\n";