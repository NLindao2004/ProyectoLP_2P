<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SpeciesController extends Controller
{
    protected $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * Listar todas las especies con filtros opcionales
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'ecosystem', 'scientific_name', 'common_name', 
                'family', 'region', 'date_from', 'date_to'
            ]);

            $species = $this->firebaseService->getSpecies($filters);

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Especies obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener especies: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva especie
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scientific_name' => 'required|string|max:255',
            'common_name' => 'required|string|max:255',
            'description' => 'required|string',
            'ecosystem' => 'required|in:forest,lake,beach',
            'family' => 'required|string|max:255',
            'region' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'images' => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'observation_date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Procesar imágenes si existen
            if ($request->hasFile('images')) {
                $imageUrls = [];
                foreach ($request->file('images') as $image) {
                    $imageUrl = $this->firebaseService->uploadImage($image);
                    $imageUrls[] = $imageUrl;
                }
                $data['images'] = $imageUrls;
            }

            $data['created_at'] = now()->toISOString();
            $data['updated_at'] = now()->toISOString();

            $speciesId = $this->firebaseService->createSpecies($data);

            return response()->json([
                'success' => true,
                'data' => ['id' => $speciesId, ...$data],
                'message' => 'Especie creada exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear especie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar especie específica
     */
    public function show(string $id): JsonResponse
    {
        try {
            $species = $this->firebaseService->getSpeciesById($id);

            if (!$species) {
                return response()->json([
                    'success' => false,
                    'message' => 'Especie no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Especie obtenida exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener especie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar especie
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scientific_name' => 'sometimes|string|max:255',
            'common_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'ecosystem' => 'sometimes|in:forest,lake,beach',
            'family' => 'sometimes|string|max:255',
            'region' => 'sometimes|string|max:255',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'images' => 'sometimes|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'observation_date' => 'sometimes|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Procesar nuevas imágenes si existen
            if ($request->hasFile('images')) {
                $imageUrls = [];
                foreach ($request->file('images') as $image) {
                    $imageUrl = $this->firebaseService->uploadImage($image);
                    $imageUrls[] = $imageUrl;
                }
                $data['images'] = $imageUrls;
            }

            $data['updated_at'] = now()->toISOString();

            $success = $this->firebaseService->updateSpecies($id, $data);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Especie no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Especie actualizada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar especie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar especie
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $success = $this->firebaseService->deleteSpecies($id);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Especie no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Especie eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar especie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de especies
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->firebaseService->getSpeciesStatistics();

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Estadísticas obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
}
