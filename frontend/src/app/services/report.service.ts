import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SpeciesFilter, ReportData, ApiResponse } from '../models/species.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener datos para reportes
   */
  getReportData(filters?: SpeciesFilter): Observable<ApiResponse<ReportData>> {
    return this.http.post<ApiResponse<ReportData>>(`${this.apiUrl}/data`, filters || {});
  }

  /**
   * Generar y descargar reporte CSV
   */
  generateCSVReport(filters?: SpeciesFilter): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/csv`, filters || {}, {
      responseType: 'blob'
    });
  }

  /**
   * Generar y descargar reporte PDF
   */
  generatePDFReport(filters?: SpeciesFilter): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/pdf`, filters || {}, {
      responseType: 'blob'
    });
  }

  /**
   * Descargar archivo desde blob
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generar nombre de archivo con timestamp
   */
  generateFilename(type: 'csv' | 'pdf', filters?: SpeciesFilter): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    let filename = `especies_reporte_${timestamp}`;
    
    if (filters?.ecosystem) {
      filename += `_${filters.ecosystem}`;
    }
    
    if (filters?.region) {
      filename += `_${filters.region.replace(/\s+/g, '_')}`;
    }
    
    return `${filename}.${type}`;
  }

  /**
   * Formatear datos de estadísticas para gráficos
   */
  formatStatisticsForCharts(statistics: any) {
    return {
      ecosystemChart: {
        labels: Object.keys(statistics.byEcosystem || {}),
        data: Object.values(statistics.byEcosystem || {}),
        colors: ['#4CAF50', '#2196F3', '#FF9800']
      },
      familyChart: {
        labels: Object.keys(statistics.byFamily || {}).slice(0, 10),
        data: Object.values(statistics.byFamily || {}).slice(0, 10)
      },
      regionChart: {
        labels: Object.keys(statistics.byRegion || {}),
        data: Object.values(statistics.byRegion || {})
      },
      monthlyChart: {
        labels: Object.keys(statistics.byMonth || {}),
        data: Object.values(statistics.byMonth || {})
      }
    };
  }

  /**
   * Generar resumen de filtros aplicados
   */
  generateFilterSummary(filters: SpeciesFilter): string {
    const summaryParts: string[] = [];
    
    if (filters.ecosystem) {
      const ecosystem = environment.app.ecosystems.find(e => e.value === filters.ecosystem);
      summaryParts.push(`Ecosistema: ${ecosystem?.label || filters.ecosystem}`);
    }
    
    if (filters.region) {
      summaryParts.push(`Región: ${filters.region}`);
    }
    
    if (filters.family) {
      summaryParts.push(`Familia: ${filters.family}`);
    }
    
    if (filters.scientificName) {
      summaryParts.push(`Nombre científico: ${filters.scientificName}`);
    }
    
    if (filters.commonName) {
      summaryParts.push(`Nombre común: ${filters.commonName}`);
    }
    
    if (filters.dateFrom && filters.dateTo) {
      summaryParts.push(`Período: ${filters.dateFrom} - ${filters.dateTo}`);
    } else if (filters.dateFrom) {
      summaryParts.push(`Desde: ${filters.dateFrom}`);
    } else if (filters.dateTo) {
      summaryParts.push(`Hasta: ${filters.dateTo}`);
    }
    
    return summaryParts.length > 0 
      ? summaryParts.join(' | ')
      : 'Sin filtros aplicados';
  }
}
