<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SpeciesController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'service' => 'Terraverde API',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString()
    ]);
});

// Rutas de autenticación
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Rutas de especies (públicas para consulta)
Route::prefix('species')->group(function () {
    // Rutas públicas de solo lectura
    Route::get('/', [SpeciesController::class, 'index']);
    Route::get('/search', [SpeciesController::class, 'search']);
    Route::get('/statistics', [SpeciesController::class, 'statistics']);
    Route::get('/{id}', [SpeciesController::class, 'show']);
    
    // Rutas protegidas para modificación
    Route::middleware('auth:api')->group(function () {
        Route::post('/', [SpeciesController::class, 'store']);
        Route::put('/{id}', [SpeciesController::class, 'update']);
        Route::delete('/{id}', [SpeciesController::class, 'destroy']);
    });
});

// Rutas de reportes
Route::prefix('reports')->group(function () {
    Route::post('/data', [ReportController::class, 'getReportData']);
    Route::post('/csv', [ReportController::class, 'generateCSV']);
    Route::post('/pdf', [ReportController::class, 'generatePDF']);
});

// Rutas de utilidades
Route::prefix('utils')->group(function () {
    Route::get('/ecosystems', function () {
        return response()->json([
            'success' => true,
            'data' => [
                ['value' => 'forest', 'label' => 'Bosque', 'icon' => '🌲'],
                ['value' => 'lake', 'label' => 'Lago', 'icon' => '🏞️'],
                ['value' => 'beach', 'label' => 'Playa', 'icon' => '🏖️']
            ]
        ]);
    });
    
    Route::get('/regions', function () {
        return response()->json([
            'success' => true,
            'data' => [
                'Costa',
                'Sierra',
                'Amazonia',
                'Galápagos'
            ]
        ]);
    });
});

// Middleware para todas las rutas API
Route::middleware(['cors'])->group(function () {
    // Las rutas ya definidas arriba se incluyen automáticamente
});

// Ruta catch-all para API no encontrada
Route::fallback(function(){
    return response()->json([
        'success' => false,
        'message' => 'Endpoint no encontrado',
        'available_endpoints' => [
            'GET /api/health' => 'Estado del servicio',
            'POST /api/auth/register' => 'Registro de usuario',
            'POST /api/auth/login' => 'Inicio de sesión',
            'GET /api/species' => 'Listar especies',
            'POST /api/species' => 'Crear especie (requiere auth)',
            'GET /api/species/{id}' => 'Obtener especie',
            'POST /api/reports/csv' => 'Generar reporte CSV',
            'POST /api/reports/pdf' => 'Generar reporte PDF',
            'GET /api/utils/ecosystems' => 'Listar ecosistemas',
            'GET /api/utils/regions' => 'Listar regiones'
        ]
    ], 404);
});
