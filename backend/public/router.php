<?php
// Headers CORS para todas las rutas
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Manejar OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Router para servidor de desarrollo PHP
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Si la request es para un archivo estático que existe, servir ese archivo
if ($request_uri !== '/' && file_exists(__DIR__ . $request_uri)) {
    return false; // Servir el archivo estático
}

// De lo contrario, enviar todo a index.php
require_once 'index.php';
?>
