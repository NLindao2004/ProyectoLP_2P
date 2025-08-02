<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Firestore;
use Kreait\Firebase\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class FirebaseService
{
    protected $firestore;
    protected $storage;
    protected $speciesCollection = 'species';

    public function __construct()
    {
        $factory = (new Factory)
            ->withServiceAccount(config('firebase.credentials'))
            ->withProjectId(config('firebase.project_id'));

        $this->firestore = $factory->createFirestore();
        $this->storage = $factory->createStorage();
    }

    /**
     * Obtener especies con filtros
     */
    public function getSpecies(array $filters = []): array
    {
        $query = $this->firestore->database()->collection($this->speciesCollection);

        // Aplicar filtros
        if (!empty($filters['ecosystem'])) {
            $query = $query->where('ecosystem', '=', $filters['ecosystem']);
        }

        if (!empty($filters['family'])) {
            $query = $query->where('family', '=', $filters['family']);
        }

        if (!empty($filters['region'])) {
            $query = $query->where('region', '=', $filters['region']);
        }

        // Filtros de fecha
        if (!empty($filters['date_from'])) {
            $query = $query->where('observation_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query = $query->where('observation_date', '<=', $filters['date_to']);
        }

        $documents = $query->documents();
        $species = [];

        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                
                // Filtros adicionales que requieren búsqueda en el lado del servidor
                if (!empty($filters['scientific_name']) && 
                    stripos($data['scientific_name'] ?? '', $filters['scientific_name']) === false) {
                    continue;
                }

                if (!empty($filters['common_name']) && 
                    stripos($data['common_name'] ?? '', $filters['common_name']) === false) {
                    continue;
                }

                $species[] = $data;
            }
        }

        return $species;
    }

    /**
     * Obtener especie por ID
     */
    public function getSpeciesById(string $id): ?array
    {
        $document = $this->firestore->database()
            ->collection($this->speciesCollection)
            ->document($id)
            ->snapshot();

        if ($document->exists()) {
            $data = $document->data();
            $data['id'] = $document->id();
            return $data;
        }

        return null;
    }

    /**
     * Crear nueva especie
     */
    public function createSpecies(array $data): string
    {
        $docRef = $this->firestore->database()
            ->collection($this->speciesCollection)
            ->add($data);

        return $docRef->id();
    }

    /**
     * Actualizar especie
     */
    public function updateSpecies(string $id, array $data): bool
    {
        try {
            $docRef = $this->firestore->database()
                ->collection($this->speciesCollection)
                ->document($id);

            // Verificar si el documento existe
            if (!$docRef->snapshot()->exists()) {
                return false;
            }

            $docRef->update($data);
            return true;
        } catch (\Exception $e) {
            throw new \Exception('Error updating species: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar especie
     */
    public function deleteSpecies(string $id): bool
    {
        try {
            $docRef = $this->firestore->database()
                ->collection($this->speciesCollection)
                ->document($id);

            // Verificar si el documento existe
            if (!$docRef->snapshot()->exists()) {
                return false;
            }

            $docRef->delete();
            return true;
        } catch (\Exception $e) {
            throw new \Exception('Error deleting species: ' . $e->getMessage());
        }
    }

    /**
     * Subir imagen a Firebase Storage
     */
    public function uploadImage(UploadedFile $file): string
    {
        $fileName = 'species/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
        $bucket = $this->storage->getBucket();
        
        $object = $bucket->upload(
            $file->getContent(),
            [
                'name' => $fileName,
                'metadata' => [
                    'contentType' => $file->getMimeType(),
                    'cacheControl' => 'public, max-age=31536000',
                ]
            ]
        );

        // Hacer el archivo público
        $object->update(['acl' => []], ['predefinedAcl' => 'publicRead']);

        // Retornar URL pública
        return sprintf(
            'https://storage.googleapis.com/%s/%s',
            $bucket->name(),
            $fileName
        );
    }

    /**
     * Obtener estadísticas de especies
     */
    public function getSpeciesStatistics(): array
    {
        $documents = $this->firestore->database()
            ->collection($this->speciesCollection)
            ->documents();

        $stats = [
            'total_species' => 0,
            'by_ecosystem' => [
                'forest' => 0,
                'lake' => 0,
                'beach' => 0
            ],
            'by_family' => [],
            'by_region' => [],
            'recent_additions' => []
        ];

        $allSpecies = [];

        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $allSpecies[] = $data;

                $stats['total_species']++;

                // Estadísticas por ecosistema
                if (isset($data['ecosystem'])) {
                    $ecosystem = $data['ecosystem'];
                    if (isset($stats['by_ecosystem'][$ecosystem])) {
                        $stats['by_ecosystem'][$ecosystem]++;
                    }
                }

                // Estadísticas por familia
                if (isset($data['family'])) {
                    $family = $data['family'];
                    $stats['by_family'][$family] = ($stats['by_family'][$family] ?? 0) + 1;
                }

                // Estadísticas por región
                if (isset($data['region'])) {
                    $region = $data['region'];
                    $stats['by_region'][$region] = ($stats['by_region'][$region] ?? 0) + 1;
                }
            }
        }

        // Ordenar y limitar estadísticas
        arsort($stats['by_family']);
        arsort($stats['by_region']);
        
        $stats['by_family'] = array_slice($stats['by_family'], 0, 10, true);
        $stats['by_region'] = array_slice($stats['by_region'], 0, 10, true);

        // Obtener adiciones recientes (últimos 10)
        usort($allSpecies, function($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });
        
        $stats['recent_additions'] = array_slice($allSpecies, 0, 10);

        return $stats;
    }

    /**
     * Buscar especies por texto
     */
    public function searchSpecies(string $query): array
    {
        $documents = $this->firestore->database()
            ->collection($this->speciesCollection)
            ->documents();

        $results = [];
        $query = strtolower($query);

        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();

                // Buscar en campos relevantes
                $searchFields = [
                    $data['scientific_name'] ?? '',
                    $data['common_name'] ?? '',
                    $data['description'] ?? '',
                    $data['family'] ?? '',
                    $data['region'] ?? ''
                ];

                $found = false;
                foreach ($searchFields as $field) {
                    if (stripos(strtolower($field), $query) !== false) {
                        $found = true;
                        break;
                    }
                }

                if ($found) {
                    $results[] = $data;
                }
            }
        }

        return $results;
    }
}
