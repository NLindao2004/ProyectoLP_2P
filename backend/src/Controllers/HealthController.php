<?php

class HealthController
{
    public function check()
    {
        try {
            // Verificar configuración básica
            $status = 'OK';
            $checks = [
                'api' => 'OK',
                'php_version' => PHP_VERSION,
                'firebase_sdk' => class_exists('Kreait\Firebase\Factory') ? 'OK' : 'ERROR',
                'environment' => $_ENV['APP_ENV'] ?? 'unknown',
                'timestamp' => date('c')
            ];

            // Verificar conexión a MySQL
            try {
                $db = DatabaseService::getInstance();
                $result = $db->fetchOne("SELECT 1 as test");
                $checks['mysql_connection'] = $result ? 'OK' : 'ERROR';
            } catch (Exception $e) {
                $checks['mysql_connection'] = 'ERROR: ' . $e->getMessage();
                $status = 'ERROR';
            }

            // Verificar variables de entorno críticas
            $required_env = ['FIREBASE_PROJECT_ID', 'GOOGLE_MAPS_API_KEY', 'DB_HOST', 'DB_DATABASE'];
            foreach ($required_env as $env_var) {
                $checks['env_' . strtolower($env_var)] = !empty($_ENV[$env_var]) ? 'OK' : 'MISSING';
                if (empty($_ENV[$env_var])) {
                    $status = 'WARNING';
                }
            }

            return [
                'success' => true,
                'status' => $status,
                'service' => 'Terraverde API',
                'version' => '1.0.0',
                'checks' => $checks,
                'message' => $status === 'OK' ? 'Sistema funcionando correctamente' : 'Sistema funcionando con advertencias'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'status' => 'ERROR',
                'service' => 'Terraverde API',
                'version' => '1.0.0',
                'error' => $e->getMessage(),
                'message' => 'Error en el sistema'
            ];
        }
    }
}
?>
