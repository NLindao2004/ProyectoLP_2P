<?php


// Configurar CORS para Angular
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';

// Obtener la ruta y método
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remover query parameters y obtener solo el path
$path = parse_url($request_uri, PHP_URL_PATH);

// ✅ RUTAS para especies
if (preg_match('#^/api/especies/?$#', $path)) {
    require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
    $controller = new EspeciesController();
    $controller->handleRequest($request_method);
    exit;
}

// ✅ RUTA para especies por región
if (preg_match('#^/api/especies/region/([^/]+)$#', $path, $matches)) {
    if ($request_method === 'GET') {
        require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
        $controller = new EspeciesController();
        $controller->getEspeciesPorRegion($matches[1]);
        exit;
    }
}

// ✅ RUTA para especie específica
if (preg_match('#^/api/especies/([^/]+)$#', $path, $matches)) {
    require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
    $controller = new EspeciesController();
    $controller->handleRequest($request_method, $matches[1]);
    exit;
}

// Health check
if ($path === '/api/health') {
    require_once __DIR__ . '/../src/Controllers/HealthController.php';
    $controller = new HealthController();
    $controller->check();
    exit;
}

// Dashboard
if ($path === '/api/dashboard') {
    require_once __DIR__ . '/../src/Controllers/DashboardController.php';
    $controller = new DashboardController();
    $controller->getStats();
    exit;
}

// Ruta no encontrada
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'Endpoint no encontrado',
    'path' => $path,
    'method' => $request_method
], JSON_PRETTY_PRINT);