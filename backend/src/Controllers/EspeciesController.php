<?php

// filepath: backend/src/Controllers/EspeciesController.php

require_once __DIR__ . '/BaseController.php';

class EspeciesController extends BaseController {

    public function handleRequest($method, $id = null) {
        if ($method === 'POST' && isset($_GET['_method']) && strtoupper($_GET['_method']) === 'PUT') {
            $method = 'PUT';
        }
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
                    //  DETECTAR si es creación con imágenes y verificar Storage
                    if (isset($_FILES['imagenes']) && !empty($_FILES['imagenes']['name'][0])) {
                        try {
                            // Verificar que Storage funciona antes de procesar
                            $testBucket = $this->storage->getBucket($_ENV['FIREBASE_STORAGE_BUCKET']);
                            error_log("Test bucket exitoso: " . $testBucket->name());
                            $this->createEspecieWithImages();
                        } catch (Exception $e) {
                            error_log("Storage no disponible, creando sin imágenes: " . $e->getMessage());
                            // Crear sin imágenes como fallback
                            $this->createEspecieFallback();
                        }
                    } else {
                        $this->createEspecie();
                    }
                    break;

                case 'PUT':
                    if (!$id) {
                        $this->sendError('ID requerido para actualizar', 400);
                        return;
                    }
                    //  DETECTAR si es actualización con imágenes
                    if (isset($_FILES['imagenes']) && !empty($_FILES['imagenes']['name'][0])) {
                        $this->updateEspecieWithImages($id);
                    } else {
                        $this->updateEspecie($id);
                    }
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

    // MÉTODO ACTUALIZADO para incluir imágenes
    private function getAllEspecies() {
        $especiesRef = $this->database->getReference('especies');
        $snapshot = $especiesRef->getSnapshot();

        $result = [];
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $key => $value) {
                $result[] = $this->formatEspecieForFrontend($value, $key);
            }
        }

        //  FORMATO compatible con Angular
        $this->sendResponse(true, [
            'especies' => $result,
            'total' => count($result)
        ], 'Especies obtenidas exitosamente');
    }


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

    // MÉTODO ACTUALIZADO para filtrar por región con imágenes
    public function getEspeciesPorRegion($region) {
        $especiesRef = $this->database->getReference('especies');
        $snapshot = $especiesRef->getSnapshot();

        $result = [];
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $key => $value) {
                $regionEspecie = $this->determinarRegion($value['coordenadas'] ?? []);

                if ($regionEspecie === $region) {
                    $result[] = $this->formatEspecieForFrontend($value, $key);
                }
            }
        }

        $this->sendResponse(true, [
            'especies' => $result,
            'region' => $region,
            'total' => count($result)
        ], "Especies de $region obtenidas exitosamente");
    }

    //  MÉTODO ACTUALIZADO para incluir imágenes
    private function getEspecie($id) {
    try {
        $especieRef = $this->database->getReference('especies/' . $id);
        $snapshot = $especieRef->getSnapshot();

        if (!$snapshot->exists()) {
            $this->sendError('Especie no encontrada', 404);
            return;
        }

        $data = $snapshot->getValue();

        // Obtener comentarios con consulta optimizada
        $comentariosQuery = $this->database->getReference('comentarios')
            ->orderByChild('especie_id')
            ->equalTo($id);

        $comentariosData = $comentariosQuery->getValue();
        $comentarios = [];

        if (is_array($comentariosData)) {
            foreach ($comentariosData as $key => $value) {
                $comentarios[] = [
                    'id' => $key,
                    'texto' => $value['texto'] ?? '',
                    'autor' => $value['autor'] ?? 'Anónimo',
                    'fecha' => $value['fecha'] ?? date('Y-m-d H:i:s')
                ];
            }
        }

        // Ordenar por fecha descendente
        usort($comentarios, function($a, $b) {
            return strtotime($b['fecha']) - strtotime($a['fecha']);
        });

        $data['comentarios'] = $comentarios;

        $this->sendResponse(true, $this->formatEspecieForFrontend($data, $id), 'Especie encontrada');

    } catch (Exception $e) {
        error_log("Error en getEspecie: " . $e->getMessage());
        $this->sendError('Error al obtener especie', 500);
    }
}

    // MÉTODO ORIGINAL sin cambios (para compatibilidad)
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
            'activo' => true,
            'imagenes' => []
        ];

        $especiesRef = $this->database->getReference('especies');
        $newRef = $especiesRef->push($nuevaEspecie);

        $nuevaEspecie['id'] = $newRef->getKey();
        $response = $this->formatEspecieForFrontend($nuevaEspecie, $nuevaEspecie['id']);
        $this->sendResponse(true, $response, 'Especie creada exitosamente');
    }


    private function createEspecieWithImages() {
        try {
            error_log("=== INICIO createEspecieWithImages ===");

            $data = $this->getRequestData();
            error_log("Datos POST: " . print_r($data, true));
            error_log("Archivos FILES: " . print_r($_FILES, true));


            $required = ['nombre_cientifico', 'nombre_vulgar', 'familia'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    error_log("Campo requerido faltante: $field");
                    $this->sendError("Campo requerido: $field", 400);
                    return;
                }
            }


            if (!isset($_FILES['imagenes'])) {
                error_log("No se encontraron archivos en _FILES['imagenes']");
                $this->sendError("No se recibieron archivos de imagen", 400);
                return;
            }


            error_log("Procesando imágenes...");
            $imageUrls = $this->uploadImages($_FILES['imagenes']);
            if ($imageUrls === false) {
                error_log("Error procesando imágenes");
                return;
            }

            error_log("Imágenes procesadas exitosamente: " . count($imageUrls) . " imágenes");

            $nuevaEspecie = [
                'nombre_cientifico' => $this->sanitizeInput($data['nombre_cientifico']),
                'nombre_vulgar' => $this->sanitizeInput($data['nombre_vulgar']),
                'familia' => $this->sanitizeInput($data['familia']),
                'estado_conservacion' => $this->sanitizeInput($data['estado_conservacion'] ?? 'No evaluado'),
                'habitat' => $this->sanitizeInput($data['habitat'] ?? ''),
                'descripcion' => $this->sanitizeInput($data['descripcion'] ?? ''),
                'coordenadas' => [
                    'latitud' => floatval($data['latitud'] ?? 0),
                    'longitud' => floatval($data['longitud'] ?? 0)
                ],
                'fecha_registro' => date('Y-m-d H:i:s'),
                'registrado_por' => $this->sanitizeInput($data['registrado_por'] ?? 'sistema'),
                'activo' => true,
                'imagenes' => $imageUrls
            ];

            error_log("Guardando en Firebase...");
            $especiesRef = $this->database->getReference('especies');
            $newRef = $especiesRef->push($nuevaEspecie);

            $nuevaEspecie['id'] = $newRef->getKey();

            // Formatear respuesta para el frontend
            $response = $this->formatEspecieForFrontend($nuevaEspecie, $nuevaEspecie['id']);
            error_log("Especie creada exitosamente con ID: " . $nuevaEspecie['id']);

            $this->sendResponse(true, $response, 'Especie creada exitosamente');

        } catch (Exception $e) {
            error_log("Exception en createEspecieWithImages: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->sendError('Error interno: ' . $e->getMessage(), 500);
        }
    }

    // MÉTODO ORIGINAL actualizado para mantener imágenes
    private function updateEspecie($id) {
        $especieRef = $this->database->getReference('especies/' . $id);
        $snapshot = $especieRef->getSnapshot();

        $data = $this->getRequestData();
        $especieActual = $snapshot->getValue();

        // Validar que el usuario autenticado es el creador
        $uid = $data['uid'] ?? null;
        if (!$uid || $especieActual['registrado_por'] !== $uid) {
            $this->sendError('No tienes permiso para editar esta especie', 403);
            return;
        }

        if (!$snapshot->exists()) {
            $this->sendError('Especie no encontrada', 404);
            return;
        }

        $data = $this->getRequestData();
            error_log("=== [updateEspecie] Datos recibidos === " . print_r($data, true)); // <-- Agrega esta línea

        $especieActual = $snapshot->getValue();

        $datosActualizados = [
            'nombre_cientifico' => $this->sanitizeInput($data['nombre_cientifico'] ?? $especieActual['nombre_cientifico']),
            'nombre_vulgar' => $this->sanitizeInput($data['nombre_vulgar'] ?? $especieActual['nombre_vulgar']),
            'familia' => $this->sanitizeInput($data['familia'] ?? $especieActual['familia']),
            'estado_conservacion' => $this->sanitizeInput($data['estado_conservacion'] ?? $especieActual['estado_conservacion']),
            'habitat' => $this->sanitizeInput($data['habitat'] ?? $especieActual['habitat']),
            'descripcion' => $this->sanitizeInput($data['descripcion'] ?? $especieActual['descripcion']),
            'coordenadas' => [
                'latitud' => floatval($data['latitud'] ?? $especieActual['coordenadas']['latitud'] ?? 0),
                'longitud' => floatval($data['longitud'] ?? $especieActual['coordenadas']['longitud'] ?? 0)
            ],
            'fecha_actualizacion' => date('Y-m-d H:i:s')
        ];

        $especieRef->update($datosActualizados);


        $especieActualizada = array_merge($especieActual, $datosActualizados);
        $response = $this->formatEspecieForFrontend($especieActualizada, $id);

        $this->sendResponse(true, $response, 'Especie actualizada exitosamente');
    }


    private function updateEspecieWithImages($id) {
        $especieRef = $this->database->getReference('especies/' . $id);
        $snapshot = $especieRef->getSnapshot();

        $data = $this->getRequestData();
        $especieActual = $snapshot->getValue();

        // Validar que el usuario autenticado es el creador
        $uid = $data['uid'] ?? null;
        if (!$uid || $especieActual['registrado_por'] !== $uid) {
            $this->sendError('No tienes permiso para editar esta especie', 403);
            return;
        }
        if (!$snapshot->exists()) {
            $this->sendError('Especie no encontrada', 404);
            return;
        }

        $data = $this->getRequestData();
        $especieActual = $snapshot->getValue();

        // Procesar nuevas imágenes
        $newImageUrls = [];
        if (isset($_FILES['imagenes']) && !empty($_FILES['imagenes']['name'][0])) {
            $newImageUrls = $this->uploadImages($_FILES['imagenes']);
            if ($newImageUrls === false) {
                return;
            }
        }

        // Gestionar imágenes existentes
        $existingImages = $especieActual['imagenes'] ?? [];
        $imagesToDelete = json_decode($data['imagesToDelete'] ?? '[]', true);
        $keepingImages = json_decode($data['keepingImages'] ?? '[]', true);

        // Filtrar imágenes que se mantienen
        $finalImages = [];
        foreach ($existingImages as $image) {
            if (in_array($image['id'], $keepingImages)) {
                $finalImages[] = $image;
            } elseif (in_array($image['id'], $imagesToDelete)) {

                $this->deleteImageFromStorage($image['url']);
            }
        }


        $finalImages = array_merge($finalImages, $newImageUrls);

        $datosActualizados = [
            'nombre_cientifico' => $this->sanitizeInput($data['nombre_cientifico'] ?? $especieActual['nombre_cientifico']),
            'nombre_vulgar' => $this->sanitizeInput($data['nombre_vulgar'] ?? $especieActual['nombre_vulgar']),
            'familia' => $this->sanitizeInput($data['familia'] ?? $especieActual['familia']),
            'estado_conservacion' => $this->sanitizeInput($data['estado_conservacion'] ?? $especieActual['estado_conservacion']),
            'habitat' => $this->sanitizeInput($data['habitat'] ?? $especieActual['habitat']),
            'descripcion' => $this->sanitizeInput($data['descripcion'] ?? $especieActual['descripcion']),
            'coordenadas' => [
                'latitud' => floatval($data['latitud'] ?? $especieActual['coordenadas']['latitud'] ?? 0),
                'longitud' => floatval($data['longitud'] ?? $especieActual['coordenadas']['longitud'] ?? 0)
            ],
            'fecha_actualizacion' => date('Y-m-d H:i:s'),
            'imagenes' => $finalImages
        ];

        $especieRef->update($datosActualizados);


        $especieActualizada = array_merge($especieActual, $datosActualizados);
        $response = $this->formatEspecieForFrontend($especieActualizada, $id);

        $this->sendResponse(true, $response, 'Especie actualizada exitosamente');
    }


    private function deleteEspecie($id) {
        $especieRef = $this->database->getReference('especies/' . $id);
        $snapshot = $especieRef->getSnapshot();

        $especieData = $snapshot->getValue();


        $data = $this->getRequestData();
        $uid = $data['uid'] ?? null;
        if (!$uid || $especieData['registrado_por'] !== $uid) {
            $this->sendError('No tienes permiso para eliminar esta especie', 403);
            return;
        }

        if (!$snapshot->exists()) {
            $this->sendError('Especie no encontrada', 404);
            return;
        }

        $especieData = $snapshot->getValue();

        // Eliminar imágenes de Firebase Storage
        if (isset($especieData['imagenes']) && is_array($especieData['imagenes'])) {
            foreach ($especieData['imagenes'] as $imagen) {
                $this->deleteImageFromStorage($imagen['url']);
            }
        }

        $especieRef->remove();
        $this->sendResponse(true, ['id' => $id], 'Especie eliminada exitosamente');
    }


    private function uploadImages($files) {
        try {
            error_log("=== INICIO uploadImages ===");
            error_log("Files recibidos: " . print_r($files, true));

            $imageUrls = [];
            $maxImages = 5;

            // Verificar número máximo de imágenes
            $fileCount = is_array($files['name']) ? count($files['name']) : 1;
            error_log("Número de archivos: $fileCount");

            if ($fileCount > $maxImages) {
                error_log("Demasiados archivos: $fileCount > $maxImages");
                $this->sendError("Máximo $maxImages imágenes permitidas", 400);
                return false;
            }

            // Normalizar estructura de archivos
            if (!is_array($files['name'])) {
                $files = [
                    'name' => [$files['name']],
                    'type' => [$files['type']],
                    'tmp_name' => [$files['tmp_name']],
                    'error' => [$files['error']],
                    'size' => [$files['size']]
                ];
            }

            for ($i = 0; $i < count($files['name']); $i++) {
                if (empty($files['name'][$i])) {
                    error_log("Archivo vacío en índice $i");
                    continue;
                }

                error_log("Procesando archivo $i: " . $files['name'][$i]);

                // Crear estructura de archivo individual
                $file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];

                // Validar archivo
                $validation = $this->validateImageFile($file);
                if ($validation !== true) {
                    error_log("Validación falló para archivo $i: $validation");
                    $this->sendError($validation, 400);
                    return false;
                }

                // Generar nombre único
                $fileName = $this->generateUniqueFileName($file['name']);
                $filePath = 'especies-images/' . $fileName;
                error_log("Subiendo archivo como: $filePath");

                try {

                    $bucket = $this->storage->getBucket();
                    error_log("Bucket obtenido: " . $bucket->name());

                    $fileContent = file_get_contents($file['tmp_name']);
                    if ($fileContent === false) {
                        throw new Exception("No se pudo leer el archivo temporal");
                    }

                    $object = $bucket->upload($fileContent, [
                        'name' => $filePath,
                        'metadata' => [
                            'contentType' => $file['type'],
                            'metadata' => [
                                'originalName' => $file['name'],
                                'uploadedAt' => date('c')
                            ]
                        ]
                    ]);


                    $object->update(['acl' => []], ['predefinedAcl' => 'publicRead']);

                    $publicUrl = sprintf(
                        'https://storage.googleapis.com/%s/%s',
                        $bucket->name(),
                        $filePath
                    );

                    $imageUrls[] = [
                        'id' => uniqid('img_', true),
                        'url' => $publicUrl,
                        'nombre' => $file['name'],
                        'size' => $file['size'],
                        'mime_type' => $file['type'],
                        'created_at' => date('Y-m-d H:i:s')
                    ];

                    error_log("Archivo subido exitosamente: $publicUrl");

                } catch (Exception $e) {
                    error_log("Error subiendo archivo $i: " . $e->getMessage());
                    error_log("Stack trace: " . $e->getTraceAsString());
                    $this->sendError('Error subiendo imagen: ' . $e->getMessage(), 500);
                    return false;
                }
            }

            error_log("Todas las imágenes subidas exitosamente: " . count($imageUrls) . " imágenes");
            return $imageUrls;

        } catch (Exception $e) {
            error_log("Exception en uploadImages: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->sendError('Error procesando imágenes: ' . $e->getMessage(), 500);
            return false;
        }
    }


    private function deleteImageFromStorage($imageUrl) {
        try {

            $urlParts = parse_url($imageUrl);
            $path = ltrim($urlParts['path'], '/');

            $bucketName = $this->storage->getBucket()->name();
            $filePath = str_replace($bucketName . '/', '', $path);

            $bucket = $this->storage->getBucket();
            $object = $bucket->object($filePath);

            if ($object->exists()) {
                $object->delete();
            }

        } catch (Exception $e) {

            error_log('Error eliminando imagen: ' . $e->getMessage());
        }
    }


    // Método para agregar comentario
   public function agregarComentario($especieId) {
    try {
        error_log("\n==== INICIO AGREGAR COMENTARIO ====");

        // 1. Leer y validar input
        $jsonInput = file_get_contents('php://input');
        if (empty($jsonInput)) {
            $this->sendError('El cuerpo de la petición está vacío', 400);
            return;
        }

        $data = json_decode($jsonInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->sendError('Formato JSON inválido', 400);
            return;
        }

        if (!isset($data['texto']) || empty(trim($data['texto']))) {
            $this->sendError('El texto del comentario es requerido', 400);
            return;
        }

        // 2. Verificar existencia de especie
        $especieRef = $this->database->getReference('especies/' . $especieId);
        if (!$especieRef->getSnapshot()->exists()) {
            $this->sendError('Especie no encontrada', 404);
            return;
        }

        // 3. Preparar y sanitizar datos del comentario
        $nuevoComentario = [
            'texto' => $this->sanitizeInput($data['texto']),
            'autor' => $this->sanitizeInput($data['autor'] ?? 'Anónimo'),
            'fecha' => date('Y-m-d H:i:s'),
            'especie_id' => $especieId,
            'estado' => 'activo' // Campo adicional para moderación
        ];

        // 4. Guardar en la base de datos
        $comentariosRef = $this->database->getReference('comentarios');
        $nuevoRef = $comentariosRef->push($nuevoComentario);

        // 5. Obtener todos los comentarios de la especie (solo activos)
        $comentariosQuery = $this->database->getReference('comentarios')
            ->orderByChild('especie_id')
            ->equalTo($especieId);

        $comentariosData = $comentariosQuery->getValue();
        $comentarios = [];

        if (is_array($comentariosData)) {
            foreach ($comentariosData as $key => $value) {
                // Filtrar solo comentarios activos
                if (($value['estado'] ?? 'activo') === 'activo') {
                    $comentarios[] = [
                        'id' => $key,
                        'texto' => $value['texto'] ?? '',
                        'autor' => $value['autor'] ?? 'Anónimo',
                        'fecha' => $value['fecha'] ?? date('Y-m-d H:i:s')
                    ];
                }
            }
        }

        // 6. Ordenar comentarios por fecha (más nuevos primero)
        usort($comentarios, function($a, $b) {
            return strtotime($b['fecha']) - strtotime($a['fecha']);
        });

        // 7. Actualizar datos de la especie
        $especieData = $especieRef->getSnapshot()->getValue();
        $especieData['comentarios'] = $comentarios;
        $especieData['fecha_actualizacion'] = date('Y-m-d H:i:s');
        $especieData['total_comentarios'] = count($comentarios);

        // 8. Responder con la especie actualizada
        $this->sendResponse(
            true,
            $this->formatEspecieForFrontend($especieData, $especieId),
            'Comentario agregado exitosamente',
            201
        );

    } catch (Exception $e) {
        error_log("Error en agregarComentario: " . $e->getMessage());
        $this->sendError('Error interno del servidor', 500);
    }
}



// Función auxiliar para enviar respuestas de error
protected function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
}

// Función auxiliar para enviar respuestas exitosas
protected function sendResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
}
// Función auxiliar para sanitizar input
protected function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

    private function formatEspecieForFrontend($especieData, $id) {
    return [
        'id' => $id,
        'nombre_cientifico' => $especieData['nombre_cientifico'] ?? '',
        'nombre_vulgar' => $especieData['nombre_vulgar'] ?? '',
        'familia' => $especieData['familia'] ?? '',
        'estado_conservacion' => $especieData['estado_conservacion'] ?? 'No evaluado',
        'habitat' => $especieData['habitat'] ?? '',
        'descripcion' => $especieData['descripcion'] ?? '',
        'coordenadas' => [
            'latitud' => floatval($especieData['coordenadas']['latitud'] ?? 0),
            'longitud' => floatval($especieData['coordenadas']['longitud'] ?? 0)
        ],
        'fecha_registro' => $especieData['fecha_registro'] ?? '',
        'fecha_actualizacion' => $especieData['fecha_actualizacion'] ?? '',
        'registrado_por' => $especieData['registrado_por'] ?? 'sistema',
        'activo' => $especieData['activo'] ?? true,
        'imagenes' => $especieData['imagenes'] ?? [],
        'comentarios' => $especieData['comentarios'] ?? []
    ];
}


    private function createEspecieFallback() {
        try {
            error_log("=== INICIO createEspecieFallback ===");

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
                'nombre_cientifico' => $this->sanitizeInput($data['nombre_cientifico']),
                'nombre_vulgar' => $this->sanitizeInput($data['nombre_vulgar']),
                'familia' => $this->sanitizeInput($data['familia']),
                'estado_conservacion' => $this->sanitizeInput($data['estado_conservacion'] ?? 'No evaluado'),
                'habitat' => $this->sanitizeInput($data['habitat'] ?? ''),
                'descripcion' => $this->sanitizeInput($data['descripcion'] ?? ''),
                'coordenadas' => [
                    'latitud' => floatval($data['latitud'] ?? 0),
                    'longitud' => floatval($data['longitud'] ?? 0)
                ],
                'fecha_registro' => date('Y-m-d H:i:s'),
                'registrado_por' => $this->sanitizeInput($data['registrado_por'] ?? 'sistema'),
                'activo' => true,
                'imagenes' => [],
                'nota_storage' => 'Creado sin imágenes - Storage temporalmente no disponible'
            ];

            $especiesRef = $this->database->getReference('especies');
            $newRef = $especiesRef->push($nuevaEspecie);

            $nuevaEspecie['id'] = $newRef->getKey();
            $response = $this->formatEspecieForFrontend($nuevaEspecie, $nuevaEspecie['id']);

            $this->sendResponse(true, $response, 'Especie creada exitosamente (sin imágenes - Storage temporalmente no disponible)');

        } catch (Exception $e) {
            error_log("Exception en createEspecieFallback: " . $e->getMessage());
            $this->sendError('Error creando especie: ' . $e->getMessage(), 500);
        }
    }
}

?>