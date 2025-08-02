<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    protected $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * Generar reporte en formato CSV
     */
    public function generateCSV(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ecosystem' => 'sometimes|in:forest,lake,beach',
            'family' => 'sometimes|string',
            'region' => 'sometimes|string',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date',
            'scientific_name' => 'sometimes|string',
            'common_name' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Filtros inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $filters = $validator->validated();
            $species = $this->firebaseService->getSpecies($filters);

            // Crear contenido CSV
            $csvContent = $this->generateCSVContent($species);
            
            $fileName = 'especies_reporte_' . date('Y-m-d_H-i-s') . '.csv';

            return Response::make($csvContent, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte CSV: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar reporte en formato PDF
     */
    public function generatePDF(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ecosystem' => 'sometimes|in:forest,lake,beach',
            'family' => 'sometimes|string',
            'region' => 'sometimes|string',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date',
            'scientific_name' => 'sometimes|string',
            'common_name' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Filtros inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $filters = $validator->validated();
            $species = $this->firebaseService->getSpecies($filters);
            $statistics = $this->firebaseService->getSpeciesStatistics();

            // Generar PDF
            $pdf = Pdf::loadView('reports.species-pdf', [
                'species' => $species,
                'statistics' => $statistics,
                'filters' => $filters,
                'generated_at' => now()->format('d/m/Y H:i:s')
            ]);

            $fileName = 'especies_reporte_' . date('Y-m-d_H-i-s') . '.pdf';

            return $pdf->download($fileName);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos para reportes (estadísticas)
     */
    public function getReportData(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'ecosystem', 'family', 'region', 
                'date_from', 'date_to', 'scientific_name', 'common_name'
            ]);

            $species = $this->firebaseService->getSpecies($filters);
            $statistics = $this->generateReportStatistics($species);

            return response()->json([
                'success' => true,
                'data' => [
                    'species_count' => count($species),
                    'species' => $species,
                    'statistics' => $statistics,
                    'filters_applied' => array_filter($filters)
                ],
                'message' => 'Datos de reporte obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos de reporte: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar contenido CSV
     */
    private function generateCSVContent(array $species): string
    {
        $csvContent = "\xEF\xBB\xBF"; // BOM para UTF-8
        
        // Cabeceras
        $headers = [
            'ID',
            'Nombre Científico',
            'Nombre Común',
            'Descripción',
            'Ecosistema',
            'Familia',
            'Región',
            'Latitud',
            'Longitud',
            'Fecha de Observación',
            'Fecha de Registro',
            'Número de Imágenes'
        ];
        
        $csvContent .= implode(',', array_map([$this, 'escapeCsvField'], $headers)) . "\n";
        
        // Datos
        foreach ($species as $specie) {
            $row = [
                $specie['id'] ?? '',
                $specie['scientific_name'] ?? '',
                $specie['common_name'] ?? '',
                $specie['description'] ?? '',
                $this->translateEcosystem($specie['ecosystem'] ?? ''),
                $specie['family'] ?? '',
                $specie['region'] ?? '',
                $specie['latitude'] ?? '',
                $specie['longitude'] ?? '',
                $specie['observation_date'] ?? '',
                $specie['created_at'] ?? '',
                count($specie['images'] ?? [])
            ];
            
            $csvContent .= implode(',', array_map([$this, 'escapeCsvField'], $row)) . "\n";
        }
        
        return $csvContent;
    }

    /**
     * Escapar campo CSV
     */
    private function escapeCsvField($field): string
    {
        $field = str_replace('"', '""', $field);
        if (strpos($field, ',') !== false || strpos($field, '"') !== false || strpos($field, "\n") !== false) {
            $field = '"' . $field . '"';
        }
        return $field;
    }

    /**
     * Traducir ecosistema
     */
    private function translateEcosystem(string $ecosystem): string
    {
        $translations = [
            'forest' => 'Bosque',
            'lake' => 'Lago',
            'beach' => 'Playa'
        ];

        return $translations[$ecosystem] ?? $ecosystem;
    }

    /**
     * Generar estadísticas del reporte
     */
    private function generateReportStatistics(array $species): array
    {
        $stats = [
            'total' => count($species),
            'by_ecosystem' => [],
            'by_family' => [],
            'by_region' => [],
            'by_month' => []
        ];

        foreach ($species as $specie) {
            // Por ecosistema
            $ecosystem = $specie['ecosystem'] ?? 'unknown';
            $stats['by_ecosystem'][$ecosystem] = ($stats['by_ecosystem'][$ecosystem] ?? 0) + 1;

            // Por familia
            $family = $specie['family'] ?? 'unknown';
            $stats['by_family'][$family] = ($stats['by_family'][$family] ?? 0) + 1;

            // Por región
            $region = $specie['region'] ?? 'unknown';
            $stats['by_region'][$region] = ($stats['by_region'][$region] ?? 0) + 1;

            // Por mes
            if (isset($specie['observation_date'])) {
                try {
                    $month = date('Y-m', strtotime($specie['observation_date']));
                    $stats['by_month'][$month] = ($stats['by_month'][$month] ?? 0) + 1;
                } catch (\Exception $e) {
                    // Ignorar fechas inválidas
                }
            }
        }

        // Ordenar estadísticas
        arsort($stats['by_ecosystem']);
        arsort($stats['by_family']);
        arsort($stats['by_region']);
        ksort($stats['by_month']);

        return $stats;
    }
}
