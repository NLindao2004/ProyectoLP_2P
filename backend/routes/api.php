<?php
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED & ~E_WARNING & ~E_NOTICE);
@ini_set('display_errors', 0);
@ini_set('display_startup_errors', 0);
if (ob_get_level()) ob_clean();

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

// ✅ RUTAS para usuarios
if (preg_match('#^/api/usuarios/?$#', $path)) {
    require_once __DIR__ . '/../src/Controllers/UsuariosController.php';
    $controller = new UsuariosController();
    $controller->handleRequest($request_method);
    exit;
}

// ✅ RUTA para usuario específico (opcional)
if (preg_match('#^/api/usuarios/([^/]+)$#', $path, $matches)) {
    require_once __DIR__ . '/../src/Controllers/UsuariosController.php';
    $controller = new UsuariosController();
    $controller->handleRequest($request_method, $matches[1]);
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