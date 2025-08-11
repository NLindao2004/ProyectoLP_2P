<?php

require_once __DIR__ . '/BaseController.php';

class UsuariosController extends BaseController {
    
    public function handleRequest($method, $id = null) {
        try {
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $this->getUsuario($id);
                    } else {
                        $this->getAllUsuarios();
                    }
                    break;

                case 'POST':
                    if (isset($_GET['action']) && $_GET['action'] === 'login') {
                        $this->loginUsuario();
                    } elseif (isset($_GET['action']) && $_GET['action'] === 'register') {
                        $this->registerUsuario();
                    } else {
                        $this->createUsuario();
                    }
                    break;

                case 'PUT':
                    if (!$id) {
                        $this->sendError('ID requerido para actualizar', 400);
                        return;
                    }
                    $this->updateUsuario($id);
                    break;

                case 'DELETE':
                    if (!$id) {
                        $this->sendError('ID requerido para eliminar', 400);
                        return;
                    }
                    $this->deleteUsuario($id);
                    break;

                default:
                    $this->sendError('Método no permitido', 405);
                    break;
            }
        } catch (Exception $e) {
            $this->sendError('Error: ' . $e->getMessage(), 500);
        }
    }

    private function getAllUsuarios() {
        $usuariosRef = $this->database->getReference('usuarios');
        $snapshot = $usuariosRef->getSnapshot();
        
        $result = [];
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $key => $value) {
                $value['id'] = $key;
                unset($value['password']);
                $result[] = $value;
            }
        }

        $this->sendResponse(true, $result, 'Usuarios obtenidos exitosamente');
    }

    private function getUsuario($id) {
        $usuarioRef = $this->database->getReference('usuarios/' . $id);
        $snapshot = $usuarioRef->getSnapshot();
        
        if ($snapshot->exists()) {
            $data = $snapshot->getValue();
            $data['id'] = $id;
            unset($data['password']);
            $this->sendResponse(true, $data, 'Usuario encontrado');
        } else {
            $this->sendError('Usuario no encontrado', 404);
        }
    }

    // REGISTRO DE USUARIO EN FIREBASE AUTH Y BASE DE DATOS
    private function registerUsuario() {
        try {
            $data = $this->getRequestData();
            error_log('Datos recibidos en registerUsuario: ' . json_encode($data));

            $required = ['nombre', 'email', 'rol', 'uid'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    error_log("Falta campo requerido: $field");
                    $this->sendError("Campo requerido: $field", 400);
                    return;
                }
            }

            // Verifica si ya existe en la base de datos
            $usuariosRef = $this->database->getReference('usuarios');
            $usuarioRef = $usuariosRef->getChild($data['uid']);
            if ($usuarioRef->getSnapshot()->exists()) {
                error_log('El usuario ya está registrado en la base de datos');
                $this->sendError('El usuario ya está registrado', 400);
                return;
            }

            // Guarda los datos adicionales en la base de datos usando el UID como clave
            $nuevoUsuario = [
                'nombre' => $data['nombre'],
                'email' => $data['email'],
                'rol' => $data['rol'],
                'institucion' => $data['institucion'] ?? '',
                'especialidad' => $data['especialidad'] ?? '',
                'telefono' => $data['telefono'] ?? '',
                'fecha_registro' => date('Y-m-d H:i:s'),
                'activo' => true,
                'ultimo_acceso' => null,
                'uid' => $data['uid']
            ];
            $usuarioRef->set($nuevoUsuario);

            $nuevoUsuario['id'] = $data['uid'];
            error_log('Usuario guardado en base de datos con ID: ' . $nuevoUsuario['id']);
            $this->sendResponse(true, $nuevoUsuario, 'Usuario registrado exitosamente');
        } catch (\Throwable $e) {
            error_log('Error inesperado en registerUsuario: ' . $e->getMessage());
            $this->sendError('Error inesperado: ' . $e->getMessage(), 500);
        }
    }

    // LOGIN: SOLO VERIFICACIÓN DE TOKEN, EL LOGIN REAL SE HACE EN EL FRONTEND
    private function loginUsuario() {
        $data = $this->getRequestData();

        if (empty($data['idToken'])) {
            $this->sendError('Token de usuario requerido', 400);
            return;
        }

        try {
            $auth = $this->auth;
            $verifiedIdToken = $auth->verifyIdToken($data['idToken']);
            $uid = $verifiedIdToken->claims()->get('sub');
            $email = $verifiedIdToken->claims()->get('email');
            $nombre = $verifiedIdToken->claims()->get('name') ?? '';

            // Buscar usuario en la base de datos por uid
            $usuariosRef = $this->database->getReference('usuarios');
            $usuarioRef = $usuariosRef->getChild($uid);
            $snapshot = $usuarioRef->getSnapshot();

            if ($snapshot->exists()) {
                $usuario = $snapshot->getValue();
                $this->sendResponse(true, $usuario, 'Login exitoso');
            } else {
                // Registrar automáticamente al usuario si no existe
                $nuevoUsuario = [
                    'nombre' => $nombre,
                    'email' => $email,
                    'rol' => 'usuario',
                    'institucion' => '',
                    'especialidad' => '',
                    'telefono' => '',
                    'fecha_registro' => date('Y-m-d H:i:s'),
                    'activo' => true,
                    'ultimo_acceso' => null,
                    'uid' => $uid
                ];
                $usuarioRef->set($nuevoUsuario);
                $nuevoUsuario['id'] = $uid;
                $this->sendResponse(true, $nuevoUsuario, 'Usuario registrado y login exitoso');
            }
        } catch (\Throwable $e) {
            $this->sendError('Token inválido: ' . $e->getMessage(), 401);
        }
    }

    // CREAR USUARIO SOLO EN BASE DE DATOS (NO RECOMENDADO PARA AUTENTICACIÓN)
    private function createUsuario() {
        $data = $this->getRequestData();
        
        $required = ['nombre', 'email', 'rol'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $this->sendError("Campo requerido: $field", 400);
                return;
            }
        }

        if ($this->emailExists($data['email'])) {
            $this->sendError('El email ya está registrado', 400);
            return;
        }

        $nuevoUsuario = [
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'rol' => $data['rol'],
            'institucion' => $data['institucion'] ?? '',
            'especialidad' => $data['especialidad'] ?? '',
            'telefono' => $data['telefono'] ?? '',
            'fecha_registro' => date('Y-m-d H:i:s'),
            'activo' => true,
            'ultimo_acceso' => null
        ];

        $usuariosRef = $this->database->getReference('usuarios');
        $newRef = $usuariosRef->push($nuevoUsuario);
        
        $nuevoUsuario['id'] = $newRef->getKey();
        $this->sendResponse(true, $nuevoUsuario, 'Usuario creado exitosamente');
    }

    private function updateUsuario($id) {
        $usuarioRef = $this->database->getReference('usuarios/' . $id);
        
        if (!$usuarioRef->getSnapshot()->exists()) {
            $this->sendError('Usuario no encontrado', 404);
            return;
        }

        $data = $this->getRequestData();
        
        if (!empty($data['email'])) {
            $currentUser = $usuarioRef->getSnapshot()->getValue();
            if ($data['email'] !== $currentUser['email'] && $this->emailExists($data['email'])) {
                $this->sendError('El email ya está registrado', 400);
                return;
            }
        }
        
        $datosActualizados = [
            'nombre' => $data['nombre'] ?? '',
            'email' => $data['email'] ?? '',
            'rol' => $data['rol'] ?? '',
            'institucion' => $data['institucion'] ?? '',
            'especialidad' => $data['especialidad'] ?? '',
            'telefono' => $data['telefono'] ?? '',
            'activo' => $data['activo'] ?? true,
            'fecha_actualizacion' => date('Y-m-d H:i:s')
        ];

        $usuarioRef->update($datosActualizados);
        $this->sendResponse(true, ['id' => $id], 'Usuario actualizado exitosamente');
    }

    private function deleteUsuario($id) {
        $usuarioRef = $this->database->getReference('usuarios/' . $id);
        
        if (!$usuarioRef->getSnapshot()->exists()) {
            $this->sendError('Usuario no encontrado', 404);
            return;
        }

        // Soft delete: marcar como inactivo en lugar de eliminar
        $usuarioRef->update([
            'activo' => false,
            'fecha_eliminacion' => date('Y-m-d H:i:s')
        ]);
        
        $this->sendResponse(true, ['id' => $id], 'Usuario desactivado exitosamente');
    }

    private function emailExists($email) {
        $usuariosRef = $this->database->getReference('usuarios');
        $query = $usuariosRef->orderByChild('email')->equalTo($email);
        $snapshot = $query->getSnapshot();
        
        return $snapshot->exists() && count($snapshot->getValue()) > 0;
    }
}

?>