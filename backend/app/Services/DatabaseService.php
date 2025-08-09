<?php
// filepath: c:\Users\Abeni\OneDrive\Documentos\Archivos ESPOL\Septimo Semestre\Lenguajes de Programacion\Proyectos\ProyectoLP_2P\backend\app\Services\DatabaseService.php

class DatabaseService
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        // Cargar variables de entorno
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();

        // Cargar configuración de base de datos
        $config = require __DIR__ . '/../../config/database.php';
        $dbConfig = $config['connections']['mysql'];

        try {
            $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset={$dbConfig['charset']}";

            $this->connection = new PDO(
                $dsn,
                $dbConfig['username'],
                $dbConfig['password'],
                $dbConfig['options']
            );

        } catch (PDOException $e) {
            throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
        }
    }

    public static function getInstance(): DatabaseService
    {
        if (self::$instance === null) {
            self::$instance = new DatabaseService();
        }
        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }

    public function query(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchAll(string $sql, array $params = []): array
    {
        return $this->query($sql, $params)->fetchAll();
    }

    public function fetchOne(string $sql, array $params = []): ?array
    {
        $result = $this->query($sql, $params)->fetch();
        return $result ?: null;
    }

    public function insert(string $table, array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));

        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, $data);

        return $this->connection->lastInsertId();
    }

    public function update(string $table, array $data, string $whereClause, array $whereParams = []): int
    {
        $setParts = [];
        foreach (array_keys($data) as $column) {
            $setParts[] = "{$column} = :{$column}";
        }
        $setClause = implode(', ', $setParts);

        $sql = "UPDATE {$table} SET {$setClause} WHERE {$whereClause}";
        $params = array_merge($data, $whereParams);

        return $this->query($sql, $params)->rowCount();
    }

    public function delete(string $table, string $whereClause, array $whereParams = []): int
    {
        $sql = "DELETE FROM {$table} WHERE {$whereClause}";
        return $this->query($sql, $whereParams)->rowCount();
    }
}