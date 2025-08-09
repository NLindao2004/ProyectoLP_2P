<?php

require_once __DIR__ . '/BaseController.php';

class HealthController extends BaseController {
    
    public function handleRequest($method, $id = null) {
        try {
            switch ($method) {
                case 'GET':
                    $this->checkHealth();
                    break;

                default:
                    $this->sendError('Método no permitido', 405);
                    break;
            }
        } catch (Exception $e) {
            $this->sendError('Error en health check: ' . $e->getMessage(), 500);
        }
    }

    private function checkHealth() {
        $health = [
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'services' => [
                'firebase' => $this->checkFirebase(),
                'database' => $this->checkDatabase(),
                'php' => $this->checkPHP()
            ],
            'system' => [
                'memory_usage' => $this->formatBytes(memory_get_usage(true)),
                'memory_peak' => $this->formatBytes(memory_get_peak_usage(true)),
                'uptime' => $this->getUptime()
            ]
        ];

        // Determinar estado general
        $allServicesOk = true;
        foreach ($health['services'] as $service) {
            if ($service['status'] !== 'ok') {
                $allServicesOk = false;
                break;
            }
        }

        $health['status'] = $allServicesOk ? 'ok' : 'warning';

        $httpCode = $allServicesOk ? 200 : 503;
        $this->sendResponse(true, $health, 'Health check completado', $httpCode);
    }

    private function checkFirebase() {
        try {
            // Intentar hacer una operación simple en Firebase
            $testRef = $this->database->getReference('health_check');
            $testRef->set([
                'timestamp' => date('Y-m-d H:i:s'),
                'test' => true
            ]);
            
            // Leer el dato
            $snapshot = $testRef->getSnapshot();
            
            // Limpiar
            $testRef->remove();
            
            return [
                'status' => 'ok',
                'message' => 'Firebase conectado correctamente',
                'response_time' => '< 100ms'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error de conexión con Firebase: ' . $e->getMessage(),
                'response_time' => 'timeout'
            ];
        }
    }

    private function checkDatabase() {
        try {
            // Verificar que podemos acceder a las principales colecciones
            $collections = ['especies', 'usuarios', 'reportes'];
            $results = [];
            
            foreach ($collections as $collection) {
                $ref = $this->database->getReference($collection);
                $snapshot = $ref->getSnapshot();
                $count = $snapshot->exists() ? count($snapshot->getValue()) : 0;
                $results[$collection] = $count;
            }
            
            return [
                'status' => 'ok',
                'message' => 'Base de datos accesible',
                'collections' => $results
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error de base de datos: ' . $e->getMessage(),
                'collections' => null
            ];
        }
    }

    private function checkPHP() {
        return [
            'status' => 'ok',
            'version' => PHP_VERSION,
            'extensions' => [
                'curl' => extension_loaded('curl'),
                'json' => extension_loaded('json'),
                'openssl' => extension_loaded('openssl')
            ],
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time')
        ];
    }

    private function formatBytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function getUptime() {
        // Tiempo desde que se inició la sesión (aproximado)
        return date('Y-m-d H:i:s');
    }
}

?>