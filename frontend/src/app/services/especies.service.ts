import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  Especie, 
  EspecieFormData, 
  ApiResponse, 
  EspeciesListResponse 
} from '../models/especies.model'; 

@Injectable({
  providedIn: 'root'
})
export class EspeciesService {
  private readonly API_URL = 'http://localhost:8000/api/especies';
  
  // Estado reactivo para la lista de especies
  private especiesSubject = new BehaviorSubject<Especie[]>([]);
  public especies$ = this.especiesSubject.asObservable();
  
  // Estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.loadEspecies();
  }

  /**
   * Obtener todas las especies
   */
  getAllEspecies(): Observable<Especie[]> {
    this.loadingSubject.next(true);
    
    return this.http.get<EspeciesListResponse>(this.API_URL, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error al obtener especies');
          }
        }),
        tap(especies => {
          this.especiesSubject.next(especies);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtener una especie por ID
   */
  getEspecieById(id: string): Observable<Especie> {
    return this.http.get<ApiResponse<Especie>>(`${this.API_URL}?id=${id}`, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Especie no encontrada');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Crear nueva especie
   */
  createEspecie(especieData: EspecieFormData): Observable<Especie> {
    this.loadingSubject.next(true);
    
    return this.http.post<ApiResponse<Especie>>(this.API_URL, especieData, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error al crear especie');
          }
        }),
        tap(nuevaEspecie => {
          // Actualizar lista local
          const especiesActuales = this.especiesSubject.value;
          this.especiesSubject.next([...especiesActuales, nuevaEspecie]);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Actualizar especie existente
   */
  updateEspecie(id: string, especieData: Partial<EspecieFormData>): Observable<void> {
    this.loadingSubject.next(true);
    
    return this.http.put<ApiResponse<any>>(`${this.API_URL}?id=${id}`, especieData, this.httpOptions)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al actualizar especie');
          }
        }),
        tap(() => {
          // Recargar lista
          this.loadEspecies();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Eliminar especie
   */
  deleteEspecie(id: string): Observable<void> {
    this.loadingSubject.next(true);
    
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}?id=${id}`, this.httpOptions)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al eliminar especie');
          }
        }),
        tap(() => {
          // Actualizar lista local
          const especiesActuales = this.especiesSubject.value;
          const especiesActualizadas = especiesActuales.filter(e => e.id !== id);
          this.especiesSubject.next(especiesActualizadas);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Buscar especies por término
   */
  searchEspecies(termino: string): Observable<Especie[]> {
    return this.especies$.pipe(
      map(especies => 
        especies.filter(especie =>
          especie.nombre_cientifico.toLowerCase().includes(termino.toLowerCase()) ||
          especie.nombre_vulgar.toLowerCase().includes(termino.toLowerCase()) ||
          especie.familia.toLowerCase().includes(termino.toLowerCase())
        )
      )
    );
  }

  /**
   * Filtrar especies por familia
   */
  getEspeciesByFamilia(familia: string): Observable<Especie[]> {
    return this.especies$.pipe(
      map(especies => especies.filter(especie => especie.familia === familia))
    );
  }

  /**
   * Obtener estadísticas
   */
  getEstadisticas(): Observable<any> {
    return this.especies$.pipe(
      map(especies => {
        const total = especies.length;
        const porFamilia = especies.reduce((acc, especie) => {
          acc[especie.familia] = (acc[especie.familia] || 0) + 1;
          return acc;
        }, {} as any);
        
        const porEstado = especies.reduce((acc, especie) => {
          acc[especie.estado_conservacion] = (acc[especie.estado_conservacion] || 0) + 1;
          return acc;
        }, {} as any);

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

  /**
   * Recargar datos
   */
  refreshData(): void {
    this.loadEspecies();
  }

  /**
   * Método privado para cargar especies
   */
  private loadEspecies(): void {
    this.getAllEspecies().subscribe({
      next: () => {
        console.log('Especies cargadas exitosamente');
      },
      error: (error) => {
        console.error('Error cargando especies:', error);
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);
    
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('Error en EspeciesService:', error);
    return throwError(() => new Error(errorMessage));
  }
}