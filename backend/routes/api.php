<?php


// Configurar CORS para Angular
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remover el prefijo del proyecto si existe
$base_path = '/ProyectoLP_2P/backend/public';
if (strpos($path, $base_path) === 0) {
    $path = substr($path, strlen($base_path));
}

// Enrutador de APIs para Terraverde
try {
    switch (true) {
        // === ESPECIES ===
        case preg_match('/^\/api\/especies$/', $path):
            require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
            $controller = new EspeciesController();
            $controller->handleRequest($method);
            break;

        case preg_match('/^\/api\/especies\/(\w+)$/', $path, $matches):
            require_once __DIR__ . '/../src/Controllers/EspeciesController.php';
            $controller = new EspeciesController();
            $controller->handleRequest($method, $matches[1]);
            break;

        // === USUARIOS ===
        case preg_match('/^\/api\/usuarios$/', $path):
            require_once __DIR__ . '/../src/Controllers/UsuariosController.php';
            $controller = new UsuariosController();
            $controller->handleRequest($method);
            break;

        case preg_match('/^\/api\/usuarios\/(\w+)$/', $path, $matches):
            require_once __DIR__ . '/../src/Controllers/UsuariosController.php';
            $controller = new UsuariosController();
            $controller->handleRequest($method, $matches[1]);
            break;

        // === REPORTES ===
        case preg_match('/^\/api\/reportes$/', $path):
            require_once __DIR__ . '/../src/Controllers/ReportesController.php';
            $controller = new ReportesController();
            $controller->handleRequest($method);
            break;

        case preg_match('/^\/api\/reportes\/(\w+)$/', $path, $matches):
            require_once __DIR__ . '/../src/Controllers/ReportesController.php';
            $controller = new ReportesController();
            $controller->handleRequest($method, $matches[1]);
            break;

        // === DASHBOARD/STATS ===
        case preg_match('/^\/api\/dashboard$/', $path):
            require_once __DIR__ . '/../src/Controllers/DashboardController.php';
            $controller = new DashboardController();
            $controller->handleRequest($method);
            break;

        // === HEALTH CHECK ===
        case preg_match('/^\/api\/health$/', $path):
            require_once __DIR__ . '/../src/Controllers/HealthController.php';
            $controller = new HealthController();
            $controller->handleRequest($method);
            break;

        // === RUTA NO ENCONTRADA ===
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Endpoint no encontrado',
                'path' => $path,
                'available_endpoints' => [
                    'GET/POST/PUT/DELETE /api/especies',
                    'GET/POST/PUT/DELETE /api/usuarios', 
                    'GET/POST/PUT/DELETE /api/reportes',
                    'GET /api/dashboard',
                    'GET /api/health'
                ]
            ]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => $e->getMessage()
    ]);
}

?>