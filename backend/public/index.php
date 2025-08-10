<?php

// Verificar si es una llamada a la API
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Si es una ruta de API, dirigir al enrutador de API
if (strpos($path, '/api/') !== false) {
    require_once __DIR__ . '/../routes/api.php';
    exit();
}

// Si no es API, mostrar información del backend
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terraverde Backend</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #2e7d32; margin-bottom: 30px; }
        .endpoint { background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4caf50; }
        .method { font-weight: bold; color: #1976d2; }
        .status { padding: 20px; background: #f0f8f0; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Terraverde Backend API</h1>
            <p>Sistema de Gestión de Biodiversidad del Ecuador</p>
        </div>

        <h3>Endpoints Disponibles:</h3>
        
        <div class="endpoint">
            <strong>Especies</strong><br>
            <span class="method">GET</span> /api/especies - Obtener todas las especies<br>
            <span class="method">GET</span> /api/especies/{id} - Obtener especie específica<br>
            <span class="method">POST</span> /api/especies - Crear nueva especie<br>
            <span class="method">PUT</span> /api/especies/{id} - Actualizar especie<br>
            <span class="method">DELETE</span> /api/especies/{id} - Eliminar especie
        </div>

        <div class="endpoint">
            <strong>Usuarios</strong><br>
            <span class="method">GET</span> /api/usuarios - Obtener todos los usuarios<br>
            <span class="method">POST</span> /api/usuarios - Crear nuevo usuario<br>
            <span class="method">PUT</span> /api/usuarios/{id} - Actualizar usuario<br>
            <span class="method">DELETE</span> /api/usuarios/{id} - Eliminar usuario
        </div>

        <div class="endpoint">
            <strong>Sistema</strong><br>
            <span class="method">GET</span> /api/health - Health check<br>
            <span class="method">GET</span> /api/dashboard - Estadísticas generales
        </div>


    </div>
</body>
</html>