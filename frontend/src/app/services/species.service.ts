import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Species, SpeciesFilter, SpeciesStatistics, ApiResponse } from '../models/species.model';

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {
  private apiUrl = `${environment.apiUrl}/species`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las especies con filtros opcionales
   */
  getSpecies(filters?: SpeciesFilter): Observable<ApiResponse<Species[]>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.ecosystem) params = params.set('ecosystem', filters.ecosystem);
      if (filters.scientificName) params = params.set('scientific_name', filters.scientificName);
      if (filters.commonName) params = params.set('common_name', filters.commonName);
      if (filters.family) params = params.set('family', filters.family);
      if (filters.region) params = params.set('region', filters.region);
      if (filters.dateFrom) params = params.set('date_from', filters.dateFrom);
      if (filters.dateTo) params = params.set('date_to', filters.dateTo);
    }

    return this.http.get<ApiResponse<Species[]>>(this.apiUrl, { params });
  }

  /**
   * Obtener una especie por ID
   */
  getSpeciesById(id: string): Observable<ApiResponse<Species>> {
    return this.http.get<ApiResponse<Species>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva especie
   */
  createSpecies(speciesData: FormData): Observable<ApiResponse<Species>> {
    return this.http.post<ApiResponse<Species>>(this.apiUrl, speciesData);
  }

  /**
   * Actualizar especie existente
   */
  updateSpecies(id: string, speciesData: FormData): Observable<ApiResponse<Species>> {
    return this.http.put<ApiResponse<Species>>(`${this.apiUrl}/${id}`, speciesData);
  }

  /**
   * Eliminar especie
   */
  deleteSpecies(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener estadísticas de especies
   */
  getStatistics(): Observable<ApiResponse<SpeciesStatistics>> {
    return this.http.get<ApiResponse<SpeciesStatistics>>(`${this.apiUrl}/statistics`);
  }

  /**
   * Buscar especies
   */
  searchSpecies(query: string): Observable<ApiResponse<Species[]>> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<Species[]>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Preparar FormData para envío de especies con imágenes
   */
  prepareSpeciesFormData(species: Partial<Species>, images?: File[]): FormData {
    const formData = new FormData();
    
    // Campos de texto
    if (species.scientificName) formData.append('scientific_name', species.scientificName);
    if (species.commonName) formData.append('common_name', species.commonName);
    if (species.description) formData.append('description', species.description);
    if (species.ecosystem) formData.append('ecosystem', species.ecosystem);
    if (species.family) formData.append('family', species.family);
    if (species.region) formData.append('region', species.region);
    if (species.latitude !== undefined) formData.append('latitude', species.latitude.toString());
    if (species.longitude !== undefined) formData.append('longitude', species.longitude.toString());
    if (species.observationDate) formData.append('observation_date', species.observationDate);

    // Imágenes
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images[]', image, image.name);
      });
    }

    return formData;
  }

  /**
   * Obtener opciones de ecosistemas
   */
  getEcosystems() {
    return environment.app.ecosystems;
  }

  /**
   * Obtener opciones de regiones
   */
  getRegions() {
    return environment.app.regions;
  }

  /**
   * Validar imágenes antes de subir
   */
  validateImages(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = environment.app.maxImageSize;
    const maxImages = environment.app.maxImagesPerSpecies;
    const supportedTypes = environment.app.supportedImageTypes;

    if (files.length > maxImages) {
      errors.push(`Máximo ${maxImages} imágenes permitidas`);
    }

    files.forEach((file, index) => {
      if (!supportedTypes.includes(file.type)) {
        errors.push(`Imagen ${index + 1}: Tipo de archivo no soportado`);
      }
      
      if (file.size > maxSize) {
        errors.push(`Imagen ${index + 1}: Tamaño máximo 5MB`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
