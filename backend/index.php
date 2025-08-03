<?php
require_once 'vendor/autoload.php';

// Cargar variables de entorno
if (file_exists('.env')) {
    $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

// Headers CORS
header('Access-Control-Allow-Origin: ' . ($_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:4200'));
header('Access-Control-Allow-Methods: ' . ($_ENV['CORS_ALLOWED_METHODS'] ?? 'GET, POST, PUT, DELETE, OPTIONS'));
header('Access-Control-Allow-Headers: ' . ($_ENV['CORS_ALLOWED_HEADERS'] ?? 'Content-Type, Authorization, X-Requested-With'));
header('Content-Type: application/json');

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remover /api del path si existe
$path = preg_replace('#^/api#', '', $path);

// Router básico
try {
    switch (true) {
        // Health check
        case $path === '/health' && $method === 'GET':
            require_once 'src/Controllers/HealthController.php';
            $controller = new HealthController();
            echo json_encode($controller->check());
            break;
            
        // Species endpoints
        case $path === '/species' && $method === 'GET':
            require_once 'src/Controllers/SpeciesController.php';
            $controller = new SpeciesController();
            echo json_encode($controller->index());
            break;
            
        case $path === '/species' && $method === 'POST':
            require_once 'src/Controllers/SpeciesController.php';
            $controller = new SpeciesController();
            echo json_encode($controller->store());
            break;
            
        case preg_match('#^/species/([^/]+)$#', $path, $matches) && $method === 'GET':
            require_once 'src/Controllers/SpeciesController.php';
            $controller = new SpeciesController();
            echo json_encode($controller->show($matches[1]));
            break;
            
        case preg_match('#^/species/([^/]+)$#', $path, $matches) && $method === 'PUT':
            require_once 'src/Controllers/SpeciesController.php';
            $controller = new SpeciesController();
            echo json_encode($controller->update($matches[1]));
            break;
            
        case preg_match('#^/species/([^/]+)$#', $path, $matches) && $method === 'DELETE':
            require_once 'src/Controllers/SpeciesController.php';
            $controller = new SpeciesController();
            echo json_encode($controller->destroy($matches[1]));
            break;
            
        case $path === '/species/statistics' && $method === 'GET':
            require_once 'src/Controllers/SpeciesController.php';
            $controller = new SpeciesController();
            echo json_encode($controller->statistics());
            break;
            
        // Reports endpoints
        case $path === '/reports/data' && $method === 'POST':
            require_once 'src/Controllers/ReportController.php';
            $controller = new ReportController();
            echo json_encode($controller->getData());
            break;
            
        case $path === '/reports/csv' && $method === 'POST':
            require_once 'src/Controllers/ReportController.php';
            $controller = new ReportController();
            $controller->generateCSV();
            break;
            
        case $path === '/reports/pdf' && $method === 'POST':
            require_once 'src/Controllers/ReportController.php';
            $controller = new ReportController();
            $controller->generatePDF();
            break;
            
        // Auth endpoints (opcional para futuro)
        case $path === '/auth/login' && $method === 'POST':
            require_once 'src/Controllers/AuthController.php';
            $controller = new AuthController();
            echo json_encode($controller->login());
            break;
            
        case $path === '/auth/register' && $method === 'POST':
            require_once 'src/Controllers/AuthController.php';
            $controller = new AuthController();
            echo json_encode($controller->register());
            break;
            
        // Utils endpoints
        case $path === '/utils/ecosystems' && $method === 'GET':
            echo json_encode([
                'success' => true,
                'data' => [
                    ['value' => 'forest', 'label' => 'Bosque', 'icon' => '🌲'],
                    ['value' => 'lake', 'label' => 'Lago', 'icon' => '🏞️'],
                    ['value' => 'beach', 'label' => 'Playa', 'icon' => '🏖️'],
                    ['value' => 'mountain', 'label' => 'Montaña', 'icon' => '⛰️'],
                    ['value' => 'river', 'label' => 'Río', 'icon' => '🏞️']
                ]
            ]);
            break;
            
        case $path === '/utils/regions' && $method === 'GET':
            echo json_encode([
                'success' => true,
                'data' => ['Costa', 'Sierra', 'Amazonia', 'Galápagos']
            ]);
            break;
            
        // 404 - Ruta no encontrada
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Endpoint no encontrado',
                'path' => $path,
                'method' => $method
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => $_ENV['APP_DEBUG'] === 'true' ? $e->getMessage() : 'Error interno'
    ]);
}
?>
