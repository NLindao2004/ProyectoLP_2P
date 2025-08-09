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
                    $this->createUsuario();
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
                // No enviar información sensible
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
            // No enviar información sensible
            unset($data['password']);
            $this->sendResponse(true, $data, 'Usuario encontrado');
        } else {
            $this->sendError('Usuario no encontrado', 404);
        }
    }

    private function createUsuario() {
        $data = $this->getRequestData();
        
        // Validar datos requeridos
        $required = ['nombre', 'email', 'rol'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $this->sendError("Campo requerido: $field", 400);
                return;
            }
        }

        // Validar email único
        if ($this->emailExists($data['email'])) {
            $this->sendError('El email ya está registrado', 400);
            return;
        }

        $nuevoUsuario = [
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'rol' => $data['rol'], // admin, investigador, usuario
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
        
        // Validar email único si se está cambiando
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