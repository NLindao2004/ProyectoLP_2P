<?php
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
