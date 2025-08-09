<?php

require_once __DIR__ . '/../../vendor/autoload.php';

class BaseController {
    protected $database;
    protected $firebase;

    public function __construct() {
        $this->initializeFirebase();
    }

    protected function initializeFirebase() {
        // Cargar variables de entorno
        $this->loadEnv(__DIR__ . '/../../.env');

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

        $factory = (new \Kreait\Firebase\Factory)
            ->withServiceAccount($firebaseConfig)
            ->withDatabaseUri($_ENV['FIREBASE_DATABASE_URL']);

        $this->database = $factory->createDatabase();
        $this->firebase = $factory;
    }

    protected function loadEnv($file) {
        if (!file_exists($file)) {
            throw new Exception("Archivo .env no encontrado");
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
        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    protected function sendError($message, $httpCode = 400) {
        $this->sendResponse(false, null, $message, $httpCode);
    }

    protected function getRequestData() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}

?>