<?php

require_once __DIR__ . '/../../vendor/autoload.php';

class BaseController {
    protected $database;
    protected $firebase;
    protected $storage;

    public function __construct() {
        // ✅ AGREGAR: Habilitar logs de errores
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        ini_set('log_errors', 1);
        ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');
        
        $this->initializeFirebase();
    }
    
    protected function initializeFirebase() {
        try {
            // Cargar variables de entorno
            $this->loadEnv(__DIR__ . '/../../.env');

            // ✅ VERIFICAR que las variables están cargadas
            $requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_STORAGE_BUCKET'];
            foreach ($requiredVars as $var) {
                if (empty($_ENV[$var])) {
                    throw new Exception("Variable de entorno faltante: $var");
                }
            }

            // Configurar Firebase
            $firebaseConfig = [
                'type' => 'service_account',
                'project_id' => $_ENV['FIREBASE_PROJECT_ID'],
                'private_key_id' => $_ENV['FIREBASE_PRIVATE_KEY_ID'],
                'private_key' => str_replace('\\n', "\n", $_ENV['FIREBASE_PRIVATE_KEY']),
                'client_email' => $_ENV['FIREBASE_CLIENT_EMAIL'],
                'client_id' => $_ENV['FIREBASE_CLIENT_ID'],
                'auth_uri' => $_ENV['FIREBASE_AUTH_URI'],
                'token_uri' => $_ENV['FIREBASE_TOKEN_URI'],
                'auth_provider_x509_cert_url' => 'https://www.googleapis.com/oauth2/v1/certs',
                'client_x509_cert_url' => $_ENV['FIREBASE_CLIENT_X509_CERT_URL']
            ];

            // ✅ SUPRIMIR warnings de Firebase durante inicialización
            $originalErrorReporting = error_reporting();
            error_reporting(E_ERROR | E_PARSE);

            try {
                // ✅ CORRECCIÓN: Inicializar con bucket por defecto
                $factory = (new \Kreait\Firebase\Factory)
                    ->withServiceAccount($firebaseConfig)
                    ->withDatabaseUri($_ENV['FIREBASE_DATABASE_URL'])
                    ->withDefaultStorageBucket($_ENV['FIREBASE_STORAGE_BUCKET']);

                $this->database = $factory->createDatabase();
                $this->firebase = $factory;
                $this->storage = $factory->createStorage();

                // ✅ VERIFICACIÓN CORREGIDA - Usar la API correcta
                try {
                    $bucket = $this->storage->getBucket();
                    error_log("✅ Storage inicializado correctamente con bucket: " . $bucket->name());
                    
                    // ✅ CORRECCIÓN: Test de escritura usando bucket.upload(), NO object.upload()
                    $testContent = 'test-connection-' . time();
                    $testPath = 'test/connection-test-' . time() . '.txt';
                    
                    $object = $bucket->upload($testContent, [
                        'name' => $testPath,
                        'metadata' => [
                            'contentType' => 'text/plain'
                        ]
                    ]);
                    
                    error_log("✅ Test de escritura exitoso: " . $testPath);
                    
                    // Limpiar archivo de test
                    $object->delete();
                    
                } catch (Exception $e) {
                    error_log("❌ Error en Storage (no crítico): " . $e->getMessage());
                    // ✅ NO fallar si Storage no funciona - solo loggear
                    error_log("⚠️ Storage no disponible, funcionará con fallback");
                }

            } finally {
                // ✅ RESTAURAR error reporting
                error_reporting($originalErrorReporting);
            }

        } catch (Exception $e) {
            error_log("Error inicializando Firebase: " . $e->getMessage());
            $this->sendError("Error de configuración del servidor: " . $e->getMessage(), 500);
            exit;
        }
    }

    protected function loadEnv($file) {
        if (!file_exists($file)) {
            throw new Exception("Archivo .env no encontrado en: $file");
        }
        
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && substr($line, 0, 1) !== '#') {
                list($key, $value) = explode('=', $line, 2);
                $value = trim($value, '"\'');
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }

    protected function sendResponse($success, $data = null, $message = '', $httpCode = 200) {
        http_response_code($httpCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    protected function sendError($message, $httpCode = 400) {
        error_log("API Error ($httpCode): $message");
        $this->sendResponse(false, null, $message, $httpCode);
    }

    protected function getRequestData() {
        try {
            // Si es FormData (con archivos), usar $_POST
            if (!empty($_POST) || !empty($_FILES)) {
                return $_POST;
            }
            
            // Si es JSON puro, usar php://input
            $json = json_decode(file_get_contents('php://input'), true);
            return $json ?? [];
        } catch (Exception $e) {
            error_log("Error obteniendo datos de request: " . $e->getMessage());
            return [];
        }
    }

    protected function validateImageFile($file, $maxSize = 5242880) { // 5MB por defecto
        try {
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            
            // Verificar errores de subida
            if ($file['error'] !== UPLOAD_ERR_OK) {
                return 'Error al subir el archivo: ' . $file['name'] . ' (Código: ' . $file['error'] . ')';
            }
            
            // Verificar tipo de archivo
            if (!in_array($file['type'], $allowedTypes)) {
                return 'Tipo de archivo no permitido: ' . $file['name'] . '. Solo se permiten JPG, PNG y WebP.';
            }
            
            // Verificar tamaño
            if ($file['size'] > $maxSize) {
                return 'Archivo muy grande: ' . $file['name'] . '. Máximo 5MB.';
            }
            
            // Verificar que sea realmente una imagen
            $imageInfo = getimagesize($file['tmp_name']);
            if (!$imageInfo) {
                return 'El archivo no es una imagen válida: ' . $file['name'];
            }
            
            return true; // Archivo válido
        } catch (Exception $e) {
            error_log("Error validando archivo: " . $e->getMessage());
            return 'Error validando archivo: ' . $file['name'];
        }
    }

    protected function generateUniqueFileName($originalName) {
        try {
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            $baseName = pathinfo($originalName, PATHINFO_FILENAME);
            $cleanBaseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
            
            return 'especie_' . uniqid() . '_' . time() . '_' . $cleanBaseName . '.' . $extension;
        } catch (Exception $e) {
            error_log("Error generando nombre de archivo: " . $e->getMessage());
            return 'especie_' . uniqid() . '.' . ($extension ?? 'jpg');
        }
    }

    protected function sanitizeInput($data) {
        try {
            if (is_array($data)) {
                return array_map([$this, 'sanitizeInput'], $data);
            }
            
            return is_string($data) ? htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8') : $data;
        } catch (Exception $e) {
            error_log("Error sanitizando input: " . $e->getMessage());
            return $data;
        }
    }
}

?>