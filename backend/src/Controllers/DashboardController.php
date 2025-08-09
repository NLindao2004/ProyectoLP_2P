<?php

require_once __DIR__ . '/BaseController.php';

class DashboardController extends BaseController {
    
    public function handleRequest($method, $id = null) {
        try {
            switch ($method) {
                case 'GET':
                    $this->getDashboardStats();
                    break;

                default:
                    $this->sendError('Método no permitido', 405);
                    break;
            }
        } catch (Exception $e) {
            $this->sendError('Error: ' . $e->getMessage(), 500);
        }
    }

    private function getDashboardStats() {
        $stats = [
            'especies' => $this->getEspeciesStats(),
            'usuarios' => $this->getUsuariosStats(),
            'reportes' => $this->getReportesStats(),
            'actividad_reciente' => $this->getActividadReciente(),
            'estado_conservacion' => $this->getEstadosConservacion(),
            'regiones' => $this->getEstadisticasPorRegion()
        ];

        $this->sendResponse(true, $stats, 'Estadísticas del dashboard obtenidas exitosamente');
    }

    private function getEspeciesStats() {
        $especiesRef = $this->database->getReference('especies');
        $snapshot = $especiesRef->getSnapshot();
        
        $total = 0;
        $activas = 0;
        $porFamilia = [];
        
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $especie) {
                $total++;
                if ($especie['activo'] ?? true) {
                    $activas++;
                }
                
                $familia = $especie['familia'] ?? 'Sin clasificar';
                $porFamilia[$familia] = ($porFamilia[$familia] ?? 0) + 1;
            }
        }

        return [
            'total' => $total,
            'activas' => $activas,
            'por_familia' => $porFamilia,
            'registradas_hoy' => $this->getRegistrosHoy('especies')
        ];
    }

    private function getUsuariosStats() {
        $usuariosRef = $this->database->getReference('usuarios');
        $snapshot = $usuariosRef->getSnapshot();
        
        $total = 0;
        $activos = 0;
        $porRol = [];
        
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $usuario) {
                $total++;
                if ($usuario['activo'] ?? true) {
                    $activos++;
                }
                
                $rol = $usuario['rol'] ?? 'usuario';
                $porRol[$rol] = ($porRol[$rol] ?? 0) + 1;
            }
        }

        return [
            'total' => $total,
            'activos' => $activos,
            'por_rol' => $porRol,
            'nuevos_hoy' => $this->getRegistrosHoy('usuarios')
        ];
    }

    private function getReportesStats() {
        $reportesRef = $this->database->getReference('reportes');
        $snapshot = $reportesRef->getSnapshot();
        
        $total = 0;
        $pendientes = 0;
        $completados = 0;
        
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $reporte) {
                $total++;
                $estado = $reporte['estado'] ?? 'pendiente';
                
                if ($estado === 'completado') {
                    $completados++;
                } else {
                    $pendientes++;
                }
            }
        }

        return [
            'total' => $total,
            'pendientes' => $pendientes,
            'completados' => $completados,
            'generados_hoy' => $this->getRegistrosHoy('reportes')
        ];
    }

    private function getActividadReciente() {
        // Obtener últimas 10 actividades del sistema
        $actividades = [];
        
        // Últimas especies registradas
        $especiesRef = $this->database->getReference('especies');
        $especiesQuery = $especiesRef->orderByChild('fecha_registro')->limitToLast(5);
        $especiesSnapshot = $especiesQuery->getSnapshot();
        
        if ($especiesSnapshot->exists()) {
            foreach ($especiesSnapshot->getValue() as $key => $especie) {
                $actividades[] = [
                    'tipo' => 'especie_registrada',
                    'descripcion' => 'Nueva especie registrada: ' . $especie['nombre_vulgar'],
                    'fecha' => $especie['fecha_registro'],
                    'id' => $key
                ];
            }
        }

        // Últimos usuarios registrados
        $usuariosRef = $this->database->getReference('usuarios');
        $usuariosQuery = $usuariosRef->orderByChild('fecha_registro')->limitToLast(5);
        $usuariosSnapshot = $usuariosQuery->getSnapshot();
        
        if ($usuariosSnapshot->exists()) {
            foreach ($usuariosSnapshot->getValue() as $key => $usuario) {
                $actividades[] = [
                    'tipo' => 'usuario_registrado',
                    'descripcion' => 'Nuevo usuario: ' . $usuario['nombre'],
                    'fecha' => $usuario['fecha_registro'],
                    'id' => $key
                ];
            }
        }

        // Ordenar por fecha (más recientes primero)
        usort($actividades, function($a, $b) {
            return strtotime($b['fecha']) - strtotime($a['fecha']);
        });

        return array_slice($actividades, 0, 10);
    }

    private function getEstadosConservacion() {
        $especiesRef = $this->database->getReference('especies');
        $snapshot = $especiesRef->getSnapshot();
        
        $estados = [];
        
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $especie) {
                $estado = $especie['estado_conservacion'] ?? 'No evaluado';
                $estados[$estado] = ($estados[$estado] ?? 0) + 1;
            }
        }

        return $estados;
    }

    private function getEstadisticasPorRegion() {
        $especiesRef = $this->database->getReference('especies');
        $snapshot = $especiesRef->getSnapshot();
        
        $regiones = [
            'Costa' => 0,
            'Sierra' => 0,
            'Amazonía' => 0,
            'Galápagos' => 0,
            'No especificado' => 0
        ];
        
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $especie) {
                $coordenadas = $especie['coordenadas'] ?? null;
                if ($coordenadas && isset($coordenadas['latitud']) && isset($coordenadas['longitud'])) {
                    $region = $this->determinarRegion($coordenadas['latitud'], $coordenadas['longitud']);
                    $regiones[$region]++;
                } else {
                    $regiones['No especificado']++;
                }
            }
        }

        return $regiones;
    }

    private function determinarRegion($latitud, $longitud) {
        // Lógica simplificada para determinar la región basada en coordenadas
        if ($longitud >= -81 && $longitud <= -79 && $latitud >= -2.5 && $latitud <= 1.5) {
            return 'Costa';
        } elseif ($longitud >= -79 && $longitud <= -77 && $latitud >= -2.5 && $latitud <= 1.5) {
            return 'Sierra';
        } elseif ($longitud >= -77 && $longitud <= -75 && $latitud >= -5 && $latitud <= 1.5) {
            return 'Amazonía';
        } elseif ($longitud >= -92 && $longitud <= -89 && $latitud >= -1.5 && $latitud <= 0.5) {
            return 'Galápagos';
        } else {
            return 'No especificado';
        }
    }

    private function getRegistrosHoy($tabla) {
        $ref = $this->database->getReference($tabla);
        $hoy = date('Y-m-d');
        
        $snapshot = $ref->getSnapshot();
        $count = 0;
        
        if ($snapshot->exists()) {
            foreach ($snapshot->getValue() as $item) {
                $fechaRegistro = $item['fecha_registro'] ?? '';
                if (strpos($fechaRegistro, $hoy) === 0) {
                    $count++;
                }
            }
        }

        return $count;
    }
}

?>