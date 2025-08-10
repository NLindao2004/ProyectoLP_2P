import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Especie, Comentario, ImagenEspecie } from '../models/especies.model'; // ✅ Agregar ImagenEspecie

export interface ApiResponse {
  success: boolean;
  data: {
    especies: Especie[];
    total: number;
  };
  message: string;
}

export interface ApiSingleResponse {
  success: boolean;
  data: Especie;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EspeciesService {
  private readonly API_URL = 'http://localhost:8000/api/especies';

  private especiesSubject = new BehaviorSubject<Especie[]>([]);
  public especies$ = this.especiesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // ✅ BANDERA para evitar múltiples cargas
  private dataLoaded = false;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // ✅ AGREGAR: HTTP options para FormData (sin Content-Type)
  private httpOptionsFormData = {
    headers: new HttpHeaders({
      'Accept': 'application/json'
      // No incluir Content-Type para FormData
    })
  };

  constructor(private http: HttpClient) {
    // ✅ REACTIVAR la carga inicial para el catálogo
    this.initializeData();
  }

  // ✅ MÉTODO DE INICIALIZACIÓN
  private initializeData(): void {
    if (!this.dataLoaded) {
      this.loadEspecies();
    }
  }

  // ✅ MÉTODOS PARA EL MAPA (sin cambios)
  getEspecies(): Observable<ApiResponse> {
    return this.http.get<any>(this.API_URL, this.httpOptions)
      .pipe(
        map(response => {
          console.log('🔧 Respuesta raw del backend para mapa:', response);
          const especiesConvertidas = response.data?.especies?.map((item: any) => this.convertirBackendAFrontend(item)) || [];

          return {
            success: response.success,
            data: {
              especies: especiesConvertidas,
              total: especiesConvertidas.length
            },
            message: response.message
          };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getEspeciesPorRegion(region: string): Observable<ApiResponse> {
    return this.http.get<any>(`${this.API_URL}/region/${region}`, this.httpOptions)
      .pipe(
        map(response => {
          const especiesConvertidas = response.data?.especies?.map((item: any) => this.convertirBackendAFrontend(item)) || [];

          return {
            success: response.success,
            data: {
              especies: especiesConvertidas,
              total: especiesConvertidas.length
            },
            message: response.message
          };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // ✅ MÉTODO PARA EL CATÁLOGO (corregido)
  getAllEspecies(): Observable<Especie[]> {
    this.loadingSubject.next(true);

    return this.http.get<any>(this.API_URL, this.httpOptions)
      .pipe(
        map(response => {
          console.log('🔧 Respuesta raw del backend para catálogo:', response);

          if (response.success && response.data && response.data.especies) {
            const especiesConvertidas = response.data.especies.map((item: any) => this.convertirBackendAFrontend(item));
            console.log('✅ Especies convertidas para catálogo:', especiesConvertidas.length);
            return especiesConvertidas;
          } else {
            console.warn('⚠️ Estructura de respuesta inesperada:', response);
            throw new Error(response.message || 'Error al obtener especies');
          }
        }),
        tap(especies => {
          this.especiesSubject.next(especies);
          this.loadingSubject.next(false);
          this.dataLoaded = true;
          console.log('✅ Especies cargadas en BehaviorSubject:', especies.length);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getEspecieById(id: string): Observable<Especie> {
    this.loadingSubject.next(true);

    return this.http.get<any>(`${this.API_URL}/${id}`, this.httpOptions)
      .pipe(
        map(response => {
          console.log('🔧 Respuesta del backend para especie individual:', response);
          
          if (response.success && response.data) {
            return this.convertirBackendAFrontend(response.data);
          } else {
            throw new Error(response.message || 'Especie no encontrada');
          }
        }),
        tap(() => {
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  // ✅ AGREGAR: Método para convertir datos del frontend al backend
  private convertirFrontendABackend(especieData: Especie): any {
    return {
      // Campos básicos
      scientific_name: especieData.nombre_cientifico,
      common_name: especieData.nombre_vulgar,
      family: especieData.familia,
      status: especieData.estado_conservacion,
      habitat: especieData.habitat,
      description: especieData.descripcion || '',
      
      // Coordenadas
      latitud: especieData.coordenadas?.latitud || 0,
      longitud: especieData.coordenadas?.longitud || 0,
      
      // Campos adicionales
      registrado_por: especieData.registrado_por || 'Usuario del sistema',
      activo: especieData.activo !== undefined ? especieData.activo : true,
      
      // Si hay fecha de registro, incluirla
      ...(especieData.fecha_registro && { created_at: especieData.fecha_registro })
    };
  }

  // ✅ CONVERSIÓN DE DATOS (mejorada)
  private convertirBackendAFrontend(backendData: any): Especie {
    // Debug para ver qué datos llegan
    console.log('🔧 Dato individual del backend:', backendData);

    return {
      id: backendData.id || backendData.key || '',
      nombre_cientifico: backendData.scientific_name || backendData.nombre_cientifico || '',
      nombre_vulgar: backendData.common_name || backendData.nombre_vulgar || '',
      familia: backendData.family || backendData.familia || '',
      estado_conservacion: backendData.status || backendData.estado_conservacion || 'No evaluado',
      habitat: backendData.habitat || '',
      descripcion: backendData.description || backendData.descripcion || '',
      coordenadas: {
        latitud: Number(
          backendData.coordenadas?.latitud ??
          backendData.latitude ??
          backendData.latitud ??
          0
        ),
        longitud: Number(
          backendData.coordenadas?.longitud ??
          backendData.longitude ??
          backendData.longitud ??
          0
        )
      },
      fecha_registro: backendData.created_at || backendData.fecha_registro || new Date().toISOString(),
      registrado_por: backendData.registrado_por || 'sistema',
      activo: backendData.activo !== undefined ? backendData.activo : true,
      // ✅ AGREGAR: Conversión de imágenes
      imagenes: this.convertirImagenesBackendAFrontend(backendData.imagenes || backendData.images || []),
      // ✅ AGREGAR: Conversión de comentarios
      comentarios: this.convertirComentariosBackendAFrontend(backendData.comentarios || backendData.comments || [])
    };
  }

  // ✅ AGREGAR: Método para convertir imágenes del backend
  private convertirImagenesBackendAFrontend(imagenesBackend: any[]): ImagenEspecie[] {
    if (!Array.isArray(imagenesBackend)) {
      return [];
    }

    return imagenesBackend.map((imagen: any) => ({
      id: imagen.id || imagen._id || '',
      url: imagen.url || imagen.path || '',
      nombre: imagen.nombre || imagen.name || imagen.filename || 'Imagen',
      descripcion: imagen.descripcion || imagen.description || '',
      size: imagen.size || 0,
      mime_type: imagen.mime_type || imagen.type || 'image/jpeg'
    }));
  }

  // ✅ AGREGAR: Método para convertir comentarios del backend
  private convertirComentariosBackendAFrontend(comentariosBackend: any[]): Comentario[] {
    if (!Array.isArray(comentariosBackend)) {
      return [];
    }

    return comentariosBackend.map((comentario: any) => ({
      id: comentario.id || comentario._id || '',
      texto: comentario.texto || comentario.text || '',
      autor: comentario.autor || comentario.author || 'Anónimo',
      fecha: comentario.fecha || comentario.created_at || new Date().toISOString()
    }));
  }

  // ✅ MÉTODOS CRUD COMPLETOS
  createEspecie(especieData: Partial<Especie>): Observable<Especie> {
    this.loadingSubject.next(true);

    const backendData = this.convertirFrontendABackend(especieData as Especie);

    return this.http.post<any>(this.API_URL, backendData, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return this.convertirBackendAFrontend(response.data);
          } else {
            throw new Error(response.message || 'Error al crear especie');
          }
        }),
        tap(nuevaEspecie => {
          const especiesActuales = this.especiesSubject.value;
          this.especiesSubject.next([...especiesActuales, nuevaEspecie]);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  createEspecieWithImages(formData: FormData): Observable<Especie> {
    this.loadingSubject.next(true);

    return this.http.post<any>(this.API_URL, formData, this.httpOptionsFormData)
      .pipe(
        map(response => {
          if (response.success) {
            return this.convertirBackendAFrontend(response.data);
          } else {
            throw new Error(response.message || 'Error al crear especie con imágenes');
          }
        }),
        tap(nuevaEspecie => {
          const especiesActuales = this.especiesSubject.value;
          this.especiesSubject.next([...especiesActuales, nuevaEspecie]);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  updateEspecie(id: string, especieData: Partial<Especie>): Observable<Especie> {
    this.loadingSubject.next(true);

    const backendData = this.convertirFrontendABackend(especieData as Especie);

    return this.http.put<any>(`${this.API_URL}/${id}`, backendData, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return this.convertirBackendAFrontend(response.data || { ...especieData, id });
          } else {
            throw new Error(response.message || 'Error al actualizar especie');
          }
        }),
        tap(especieActualizada => {
          const especiesActuales = this.especiesSubject.value;
          const index = especiesActuales.findIndex(e => e.id === id);
          if (index >= 0) {
            especiesActuales[index] = especieActualizada;
            this.especiesSubject.next([...especiesActuales]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  updateEspecieWithImages(id: string, formData: FormData): Observable<Especie> {
    this.loadingSubject.next(true);

    // Cambia PUT por POST y agrega _method=PUT
    return this.http.post<any>(`${this.API_URL}/${id}?_method=PUT`, formData, this.httpOptionsFormData)
      .pipe(
        map(response => {
          if (response.success) {
            return this.convertirBackendAFrontend(response.data);
          } else {
            throw new Error(response.message || 'Error al actualizar especie con imágenes');
          }
        }),
        tap(especieActualizada => {
          const especiesActuales = this.especiesSubject.value;
          const index = especiesActuales.findIndex(e => e.id === id);
          if (index >= 0) {
            especiesActuales[index] = especieActualizada;
            this.especiesSubject.next([...especiesActuales]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  deleteEspecie(id: string): Observable<void> {
    this.loadingSubject.next(true);

    return this.http.delete<any>(`${this.API_URL}/${id}`, this.httpOptions)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al eliminar especie');
          }
        }),
        tap(() => {
          const especiesActuales = this.especiesSubject.value;
          const especiesActualizadas = especiesActuales.filter(e => e.id !== id);
          this.especiesSubject.next(especiesActualizadas);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // ✅ AGREGAR: Método para eliminar imagen específica
  deleteImagenEspecie(especieId: string, imagenId: string): Observable<Especie> {
    this.loadingSubject.next(true);

    return this.http.delete<any>(`${this.API_URL}/${especieId}/imagenes/${imagenId}`, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return this.convertirBackendAFrontend(response.data);
          } else {
            throw new Error(response.message || 'Error al eliminar imagen');
          }
        }),
        tap(especieActualizada => {
          const especiesActuales = this.especiesSubject.value;
          const index = especiesActuales.findIndex(e => e.id === especieId);
          if (index >= 0) {
            especiesActuales[index] = especieActualizada;
            this.especiesSubject.next([...especiesActuales]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // ✅ AGREGAR: Método para agregar imágenes a especie existente
  addImagenesEspecie(especieId: string, formData: FormData): Observable<Especie> {
    this.loadingSubject.next(true);

    return this.http.post<any>(`${this.API_URL}/${especieId}/imagenes`, formData, this.httpOptionsFormData)
      .pipe(
        map(response => {
          if (response.success) {
            return this.convertirBackendAFrontend(response.data);
          } else {
            throw new Error(response.message || 'Error al agregar imágenes');
          }
        }),
        tap(especieActualizada => {
          const especiesActuales = this.especiesSubject.value;
          const index = especiesActuales.findIndex(e => e.id === especieId);
          if (index >= 0) {
            especiesActuales[index] = especieActualizada;
            this.especiesSubject.next([...especiesActuales]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // ✅ MÉTODO refreshData MEJORADO
  refreshData(): void {
    console.log('🔄 Refrescando datos...');
    this.dataLoaded = false; // Resetear bandera
    this.getAllEspecies().subscribe({
      next: (especies) => {
        console.log('✅ Datos refrescados exitosamente:', especies.length, 'especies');
      },
      error: (error: any) => {
        console.error('❌ Error refrescando datos:', error);
        this.loadingSubject.next(false);
      }
    });
  }

  // ✅ MÉTODO PRIVADO PARA CARGA INICIAL
  private loadEspecies(): void {
    this.getAllEspecies().subscribe({
      next: (especies) => {
        console.log('✅ Carga inicial completada:', especies.length, 'especies');
      },
      error: (error: any) => {
        console.error('❌ Error en carga inicial:', error);
        this.loadingSubject.next(false);
      }
    });
  }

  // ✅ MÉTODOS DE BÚSQUEDA Y ESTADÍSTICAS
  searchEspecies(termino: string): Observable<Especie[]> {
    return this.especies$.pipe(
      map(especies =>
        especies.filter(especie =>
          especie.nombre_cientifico.toLowerCase().includes(termino.toLowerCase()) ||
          especie.nombre_vulgar.toLowerCase().includes(termino.toLowerCase()) ||
          (especie.familia?.toLowerCase() || '').includes(termino.toLowerCase())
        )
      )
    );
  }

  getEspeciesByFamilia(familia: string): Observable<Especie[]> {
    return this.especies$.pipe(
      map(especies => especies.filter(especie => especie.familia === familia))
    );
  }

  getEstadisticas(): Observable<any> {
    return this.especies$.pipe(
      map(especies => {
        const total = especies.length;
        const porFamilia = especies.reduce((acc, especie) => {
          const familia = especie.familia || 'Sin familia';
          acc[familia] = (acc[familia] || 0) + 1;
          return acc;
        }, {} as {[key: string]: number});

        const porEstado = especies.reduce((acc, especie) => {
          acc[especie.estado_conservacion] = (acc[especie.estado_conservacion] || 0) + 1;
          return acc;
        }, {} as {[key: string]: number});

        return {
          total,
          porFamilia,
          porEstado,
          familiasPrincipales: Object.keys(porFamilia)
            .sort((a, b) => porFamilia[b] - porFamilia[a])
            .slice(0, 5)
        };
      })
    );
  }

  // ✅ AGREGAR MÉTODO para comentarios (que tu compañero necesita)
  agregarComentario(especieId: string, comentario: Comentario): Observable<Especie> {
    this.loadingSubject.next(true);

    return this.http.post<any>(`${this.API_URL}/${especieId}/comentarios`, comentario, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return this.convertirBackendAFrontend(response.data);
          } else {
            throw new Error(response.message || 'Error al agregar comentario');
          }
        }),
        tap(especieActualizada => {
          const especiesActuales = this.especiesSubject.value;
          const index = especiesActuales.findIndex(e => e.id === especieId);
          if (index >= 0) {
            especiesActuales[index] = especieActualizada;
            this.especiesSubject.next([...especiesActuales]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // ✅ MANEJO DE ERRORES
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);

    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8000';
      } else if (error.status === 404) {
        errorMessage = 'Endpoint no encontrado - verifica las rutas del backend';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('❌ Error en EspeciesService:', error);
    return throwError(() => new Error(errorMessage));
  }
}