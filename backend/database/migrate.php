<?php
// filepath: c:\Users\Abeni\OneDrive\Documentos\Archivos ESPOL\Septimo Semestre\Lenguajes de Programacion\Proyectos\ProyectoLP_2P\backend\database\migrate.php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../app/Services/DatabaseService.php';

class MigrationRunner
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
        $this->ensureMigrationsTable();
    }

    private function ensureMigrationsTable()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS migrations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            migration VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $this->db->query($sql);
    }

    public function run()
    {
        echo "🔄 Buscando migraciones pendientes...\n\n";

        // Obtener migraciones ya ejecutadas
        $executed = $this->getExecutedMigrations();

        // Obtener archivos de migración
        $migrationFiles = $this->getMigrationFiles();

        $pendingCount = 0;

        foreach ($migrationFiles as $file) {
            $filename = basename($file);

            if (in_array($filename, $executed)) {
                echo "⏭️  Saltando: {$filename} (ya ejecutada)\n";
                continue;
            }

            echo "🚀 Ejecutando: {$filename}... ";

            try {
                $this->executeMigration($file);
                $this->markAsExecuted($filename);
                echo "✅ Completada\n";
                $pendingCount++;
            } catch (Exception $e) {
                echo "❌ Error: " . $e->getMessage() . "\n";
                echo "📄 Archivo: {$file}\n";
                // No marcar como ejecutada si falló
                break;
            }
        }

        if ($pendingCount == 0) {
            echo "\n✨ No hay migraciones pendientes. Base de datos actualizada.\n";
        } else {
            echo "\n🎉 {$pendingCount} migraciones ejecutadas correctamente!\n";
        }

        $this->showStatus();
    }

    private function getExecutedMigrations()
    {
        try {
            $result = $this->db->fetchAll("SELECT migration FROM migrations ORDER BY executed_at");
            return array_column($result, 'migration');
        } catch (Exception $e) {
            return [];
        }
    }

    private function getMigrationFiles()
    {
        $migrationsPath = __DIR__ . '/migrations/';
        $seedsPath = __DIR__ . '/seeds/';

        $files = array_merge(
            glob($migrationsPath . '*.sql'),
            glob($seedsPath . '*.sql')
        );

        sort($files);
        return $files;
    }

    private function executeMigration($file)
    {
        $sql = file_get_contents($file);

        // Remover comentarios de línea
        $lines = explode("\n", $sql);
        $cleanLines = [];

        foreach ($lines as $line) {
            $line = trim($line);
            // Ignorar líneas vacías y comentarios
            if (!empty($line) && !preg_match('/^--/', $line)) {
                $cleanLines[] = $line;
            }
        }

        $cleanSql = implode("\n", $cleanLines);

        // Dividir por punto y coma
        $statements = explode(';', $cleanSql);

        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                echo "\n🔧 Ejecutando: " . substr(str_replace("\n", " ", $statement), 0, 60) . "...\n";
                try {
                    $this->db->getConnection()->exec($statement);
                    echo "✅ Statement OK\n";
                } catch (PDOException $e) {
                    echo "❌ Error SQL: " . $e->getMessage() . "\n";
                    echo "📝 Statement: " . $statement . "\n";
                    throw new Exception("Error ejecutando SQL: " . $e->getMessage());
                }
            }
        }
    }

    private function markAsExecuted($filename)
    {
        $this->db->query(
            "INSERT IGNORE INTO migrations (migration) VALUES (?)",
            [$filename]
        );
    }

    private function showStatus()
    {
        echo "\n📊 Estado de migraciones:\n";
        $migrations = $this->db->fetchAll("SELECT migration, executed_at FROM migrations ORDER BY executed_at");

        foreach ($migrations as $migration) {
            echo "  ✅ {$migration['migration']} - {$migration['executed_at']}\n";
        }

        // Mostrar tablas actuales
        echo "\n📋 Tablas en la base de datos:\n";
        $tables = $this->db->fetchAll("SHOW TABLES");
        foreach ($tables as $table) {
            $tableName = array_values($table)[0];
            echo "  📄 {$tableName}\n";
        }
    }

    public function reset($migration = null)
    {
        if ($migration) {
            echo "🔄 Eliminando migración: {$migration}\n";
            $this->db->query("DELETE FROM migrations WHERE migration = ?", [$migration]);
            echo "✅ Migración eliminada del registro. Puedes ejecutarla de nuevo.\n";
        } else {
            echo "❌ Especifica la migración a resetear\n";
        }
    }
}

// Ejecutar migraciones
try {
    $runner = new MigrationRunner();

    // Verificar argumentos de línea de comandos
    if (isset($argv[1])) {
        switch ($argv[1]) {
            case 'reset':
                if (isset($argv[2])) {
                    $runner->reset($argv[2]);
                } else {
                    echo "❌ Uso: php migrate.php reset nombre_migracion.sql\n";
                }
                break;
            default:
                $runner->run();
        }
    } else {
        $runner->run();
    }

} catch (Exception $e) {
    echo "❌ Error fatal: " . $e->getMessage() . "\n";
    exit(1);
}