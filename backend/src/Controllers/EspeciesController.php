<?php
// filepath: backend/src/Controllers/EspeciesController.php

require_once __DIR__ . '/BaseController.php';

class EspeciesController extends BaseController {

    public function handleRequest($method, $id = null) {
        try {
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $this->getEspecie($id);
                    } else {
                        $this->getAllEspecies();
                    }
                    break;

                case 'POST':
                    $this->createEspecie();
                    break;

                case 'PUT':
                    if (!$id) {
                        $this->sendError('ID requerido para actualizar', 400);
                        return;
                    }
                    $this->updateEspecie($id);
                    break;

                case 'DELETE':
                    if (!$id) {
                        $this->sendError('ID requerido para eliminar', 400);
                        return;
                    }
                    $this->deleteEspecie($id);
                    break;

                default:
                    $this->sendError('Método no permitido', 405);
                    break;
            }
        } catch (Exception $e) {
            $this->sendError('Error: ' . $e->getMessage(), 500);
        }
    }

    // ✅ MÉTODO ACTUALIZADO para el mapa
    private function getAllEspecies() {
        $especiesRef = $this->database->getReference('especies');
        $snapshot = $especiesRef->getSnapshot();

        $result = [];
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $key => $value) {
                // Formatear datos para el mapa
                $especie = [
                    'id' => $key,
                    'common_name' => $value['nombre_vulgar'] ?? '',
                    'scientific_name' => $value['nombre_cientifico'] ?? '',
                    'status' => $value['estado_conservacion'] ?? 'No evaluado',
                    'habitat' => $value['habitat'] ?? '',
                    'region' => $this->determinarRegion($value['coordenadas'] ?? []),
                    'latitude' => floatval($value['coordenadas']['latitud'] ?? 0),
                    'longitude' => floatval($value['coordenadas']['longitud'] ?? 0),
                    'description' => $value['descripcion'] ?? '',
                    'family' => $value['familia'] ?? '',
                    'created_at' => $value['fecha_registro'] ?? null
                ];
                $result[] = $especie;
            }
        }

        // ✅ FORMATO compatible con Angular
        $this->sendResponse(true, [
            'especies' => $result,
            'total' => count($result)
        ], 'Especies obtenidas exitosamente');
    }

    // ✅ NUEVO MÉTODO para determinar región por coordenadas
    private function determinarRegion($coordenadas) {
        $lat = floatval($coordenadas['latitud'] ?? 0);
        $lng = floatval($coordenadas['longitud'] ?? 0);

        if ($lat == 0 && $lng == 0) return 'Sin ubicación';

        // Rangos aproximados de Ecuador
        if ($lng >= -92 && $lng <= -89) {
            return 'Galapagos';
        } elseif ($lng >= -81 && $lat >= -3) {
            return 'Costa';
        } elseif ($lng >= -79 && $lng <= -77) {
            return 'Amazonia';
        } else {
            return 'Sierra';
        }
    }

    // ✅ NUEVO MÉTODO para filtrar por región
    public function getEspeciesPorRegion($region) {
        $especiesRef = $this->database->getReference('especies');
        $snapshot = $especiesRef->getSnapshot();

        $result = [];
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $key => $value) {
                $regionEspecie = $this->determinarRegion($value['coordenadas'] ?? []);

                if ($regionEspecie === $region) {
                    $especie = [
                        'id' => $key,
                        'common_name' => $value['nombre_vulgar'] ?? '',
                        'scientific_name' => $value['nombre_cientifico'] ?? '',
                        'status' => $value['estado_conservacion'] ?? 'No evaluado',
                        'habitat' => $value['habitat'] ?? '',
                        'region' => $regionEspecie,
                        'latitude' => floatval($value['coordenadas']['latitud'] ?? 0),
                        'longitude' => floatval($value['coordenadas']['longitud'] ?? 0),
                        'description' => $value['descripcion'] ?? '',
                        'family' => $value['familia'] ?? ''
                    ];
                    $result[] = $especie;
                }
            }
        }

        $this->sendResponse(true, [
            'especies' => $result,
            'region' => $region,
            'total' => count($result)
        ], "Especies de $region obtenidas exitosamente");
    }

    private function getEspecie($id) {
        $especieRef = $this->database->getReference('especies/' . $id);
        $snapshot = $especieRef->getSnapshot();

        if ($snapshot->exists()) {
            $data = $snapshot->getValue();
            $data['id'] = $id;
            $this->sendResponse(true, $data, 'Especie encontrada');
        } else {
            $this->sendError('Especie no encontrada', 404);
        }
    }

    private function createEspecie() {
        $data = $this->getRequestData();

        // Validar datos requeridos
        $required = ['nombre_cientifico', 'nombre_vulgar', 'familia'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $this->sendError("Campo requerido: $field", 400);
                return;
            }
        }

        $nuevaEspecie = [
            'nombre_cientifico' => $data['nombre_cientifico'],
            'nombre_vulgar' => $data['nombre_vulgar'],
            'familia' => $data['familia'],
            'estado_conservacion' => $data['estado_conservacion'] ?? 'No evaluado',
            'habitat' => $data['habitat'] ?? '',
            'descripcion' => $data['descripcion'] ?? '',
            'coordenadas' => [
                'latitud' => floatval($data['latitud'] ?? 0),
                'longitud' => floatval($data['longitud'] ?? 0)
            ],
            'fecha_registro' => date('Y-m-d H:i:s'),
            'registrado_por' => $data['registrado_por'] ?? 'sistema',
            'activo' => true
        ];

        $especiesRef = $this->database->getReference('especies');
        $newRef = $especiesRef->push($nuevaEspecie);

        $nuevaEspecie['id'] = $newRef->getKey();
        $this->sendResponse(true, $nuevaEspecie, 'Especie creada exitosamente');
    }

    private function updateEspecie($id) {
        $especieRef = $this->database->getReference('especies/' . $id);

        if (!$especieRef->getSnapshot()->exists()) {
            $this->sendError('Especie no encontrada', 404);
            return;
        }

        $data = $this->getRequestData();

        $datosActualizados = [
            'nombre_cientifico' => $data['nombre_cientifico'] ?? '',
            'nombre_vulgar' => $data['nombre_vulgar'] ?? '',
            'familia' => $data['familia'] ?? '',
            'estado_conservacion' => $data['estado_conservacion'] ?? '',
            'habitat' => $data['habitat'] ?? '',
            'descripcion' => $data['descripcion'] ?? '',
            'coordenadas' => [
                'latitud' => floatval($data['latitud'] ?? 0),
                'longitud' => floatval($data['longitud'] ?? 0)
            ],
            'fecha_actualizacion' => date('Y-m-d H:i:s')
        ];

        $especieRef->update($datosActualizados);
        $this->sendResponse(true, ['id' => $id], 'Especie actualizada exitosamente');
    }

    private function deleteEspecie($id) {
        $especieRef = $this->database->getReference('especies/' . $id);

        if (!$especieRef->getSnapshot()->exists()) {
            $this->sendError('Especie no encontrada', 404);
            return;
        }

        $especieRef->remove();
        $this->sendResponse(true, ['id' => $id], 'Especie eliminada exitosamente');
    }
}

?>