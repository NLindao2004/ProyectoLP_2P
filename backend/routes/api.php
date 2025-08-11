
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

error_log("Solicitud recibida: $request_method $path");

// 1. RUTA PARA AGREGAR COMENTARIOS (DEBE ESTAR PRIMERO)
if (preg_match('#^/api/especies/([^/]+)/comentarios$#', $path, $matches)) {
    error_log("Ruta de comentarios detectada para especie ID: {$matches[1]}");
    if ($request_method === 'POST') {
        require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
        $controller = new EspeciesController();
        $controller->agregarComentario($matches[1]);
        exit;
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido. Use POST'
        ]);
        exit;
    }
}

// 2. RUTAS para especies
if (preg_match('#^/api/especies/?$#', $path)) {
    require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
    $controller = new EspeciesController();
    $controller->handleRequest($request_method);
    exit;
}

// 3. RUTA para especies por región
if (preg_match('#^/api/especies/region/([^/]+)$#', $path, $matches)) {
    if ($request_method === 'GET') {
        require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
        $controller = new EspeciesController();
        $controller->getEspeciesPorRegion($matches[1]);
        exit;
    }
}

// 4. RUTA para especie específica
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

// 6. Dashboard
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
    'method' => $request_method,
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT);
