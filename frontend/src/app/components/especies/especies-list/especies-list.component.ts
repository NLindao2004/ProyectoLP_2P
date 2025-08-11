import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EspeciesService } from '../../../services/especies.service';
import { Especie } from '../../../models/especies.model';
import { Comentario} from '../../../models/especies.model';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service'; // Agrega este import

@Component({
  selector: 'app-especies-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especies-list.component.html',
  styleUrls: ['./especies-list.component.scss']
})
export class EspeciesListComponent implements OnInit, OnDestroy {
  especies: Especie[] = [];
  especiesFiltradas: Especie[] = [];
  selectedEspecie: Especie | null = null;
  loading = false;

  // Filtros
  searchTerm = '';
  selectedFamilia = '';
  selectedEstado = '';
  familias: string[] = [];



  // ✅ AGREGAR: Output para emitir evento de edición
  @Output() editEspecie = new EventEmitter<Especie>();

  // Estadísticas
  totalEspecies = 0;

  // Comentarios
  nuevoComentario: { [key: string]: string } = {};
  caracteresRestantes: { [key: string]: number } = {};
  cargandoComentario: { [key: string]: boolean } = {};
  comentarios: { [key: string]: any[] } = {};
  usuarioUid: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private especiesService: EspeciesService,
    private router: Router,
    private usuarioService: UsuarioService 
  ) {}

  ngOnInit(): void {
    this.usuarioUid = this.usuarioService.getUid(); // Obtén el UID al iniciar
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.especiesService.especies$
      .pipe(takeUntil(this.destroy$))
      .subscribe(especies => {
        this.especies = especies;
        this.especiesFiltradas = especies;
        this.totalEspecies = especies.length;
        this.updateFamilias();
        this.applyFilters();
        this.loadComentariosForAllSpecies();
      });

    this.especiesService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
  }


  private updateFamilias(): void {
    this.familias = [...new Set(this.especies.map(e => e.familia))].sort();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFamiliaChange(): void {
    this.applyFilters();
  }

  onEstadoChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.especies;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(especie =>
        especie.nombre_cientifico.toLowerCase().includes(term) ||
        especie.nombre_vulgar.toLowerCase().includes(term) ||
        especie.familia.toLowerCase().includes(term) ||
        especie.habitat.toLowerCase().includes(term)
      );
    }

    if (this.selectedFamilia) {
      filtered = filtered.filter(especie => especie.familia === this.selectedFamilia);
    }

    if (this.selectedEstado) {
      filtered = filtered.filter(especie => especie.estado_conservacion === this.selectedEstado);
    }

    this.especiesFiltradas = filtered;
  }

  selectEspecie(especie: Especie): void {
    this.router.navigate(['/especies', especie.id]);

  }

  // ✅ MODIFICAR: Método para editar especie (ahora emite evento)
  onEditEspecie(especie: Especie): void {
    console.log('Emitiendo evento de edición para:', especie.nombre_cientifico);
    this.editEspecie.emit(especie);
  }

  deleteEspecie(especie: Especie): void {
    if (confirm(`¿Estás seguro de eliminar "${especie.nombre_vulgar}"?`)) {
      this.especiesService.deleteEspecie(especie.id!).subscribe({
        next: () => {
          console.log('Especie eliminada exitosamente');
          // La lista se actualizará automáticamente por el observable
        },
        error: (error) => {
          console.error('Error eliminando especie:', error);
          alert('Error al eliminar la especie: ' + error.message);
        }
      });
    }
  }

  viewOnMap(especie: Especie): void {
    console.log('Ver en mapa:', especie);
    // TODO: Implementar navegación al mapa con la especie seleccionada
    // this.router.navigate(['/mapa'], { queryParams: { especieId: especie.id } });
  }

  refreshData(): void {
    this.especiesService.refreshData();
  }

  // Métodos para comentarios
  private loadComentariosForAllSpecies(): void {
    // Ya no necesitamos cargar comentarios por separado
    // Los comentarios vienen incluidos en cada especie
    this.especies.forEach(especie => {
      this.caracteresRestantes[especie.id!] = 500;
      // Inicializamos el campo de nuevo comentario
      this.nuevoComentario[especie.id!] = '';
    });
  }

  agregarComentario(especieId: string) {
    if (!this.nuevoComentario[especieId]?.trim()) return;

    const nuevoComent: Comentario = {
      texto: this.nuevoComentario[especieId].trim(),
      autor: 'Usuario', // Reemplaza con tu lógica de usuario real
      fecha: new Date().toISOString()
    };

    this.cargandoComentario[especieId] = true;

    this.especiesService.agregarComentario(especieId, nuevoComent)
      .subscribe({
        next: (especieActualizada) => {
          const index = this.especies.findIndex(e => e.id === especieId);
          if (index !== -1) {
            // ✅ Actualizamos solo el array de comentarios
            this.especies[index].comentarios = especieActualizada.comentarios;
          }

          // Actualizamos la lista filtrada
          this.especiesFiltradas = [...this.especies];

          // Limpiar el campo de texto
          this.nuevoComentario[especieId] = '';

          // Marcar como terminado
          this.cargandoComentario[especieId] = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.cargandoComentario[especieId] = false;
          alert('Error al agregar comentario: ' + err.message);
        }
      });
  }

  // Métodos para reportes (mantener existentes)
  generateReport(format: 'csv' | 'pdf'): void {
    const especiesReporte = this.especiesFiltradas;

    if (especiesReporte.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    if (format === 'csv') {
      this.generateCSV(especiesReporte);
    } else {
      this.generatePDF(especiesReporte);
    }
  }

  private generateCSV(especies: Especie[]): void {
    const csvContent = this.convertToCSV(especies);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = this.generateFileName('csv');
    saveAs(blob, fileName);
  }

  private generatePDF(especies: Especie[]): void {
    try {
      const doc = new jsPDF();
      const fileName = this.generateFileName('pdf');

      let y = 20;
      const lineHeight = 7;
      const pageHeight = doc.internal.pageSize.height;

      doc.setFontSize(18);
      doc.text('Reporte de Especies', 14, y);
      y += lineHeight * 2;

      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, y);
      y += lineHeight;

      const filters = this.getActiveFilters();
      doc.text(`Filtros aplicados: ${filters}`, 14, y);
      y += lineHeight * 2;

      doc.setFontSize(8);
      especies.forEach(especie => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        doc.text(`Nombre Científico: ${especie.nombre_cientifico || '-'}`, 14, y);
        y += lineHeight;
        doc.text(`Nombre Vulgar: ${especie.nombre_vulgar || '-'}`, 14, y);
        y += lineHeight;
        doc.text(`Familia: ${especie.familia || '-'}`, 14, y);
        y += lineHeight;
        doc.text(`Estado: ${especie.estado_conservacion || '-'}`, 14, y);
        y += lineHeight;
        doc.text(`Hábitat: ${especie.habitat || '-'}`, 14, y);
        y += lineHeight;
        doc.text(`Ubicación: ${especie.coordenadas ?
          `${especie.coordenadas.latitud?.toFixed(4)}, ${especie.coordenadas.longitud?.toFixed(4)}` : '-'}`, 14, y);
        y += lineHeight * 2;
      });

      doc.save(fileName);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.generateCSV(especies);
    }
  }

  private getActiveFilters(): string {
    const filters = [];
    if (this.searchTerm) filters.push(`Búsqueda: "${this.searchTerm}"`);
    if (this.selectedFamilia) filters.push(`Familia: ${this.selectedFamilia}`);
    if (this.selectedEstado) filters.push(`Estado: ${this.selectedEstado}`);
    return filters.join(', ') || 'Ningún filtro aplicado';
  }

  private generateFileName(extension: string): string {
    let fileName = 'reporte_especies';
    const normalize = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
       .replace(/[^a-zA-Z0-9]/g, '_');

    if (this.searchTerm) fileName += `_busqueda-${normalize(this.searchTerm)}`;
    if (this.selectedFamilia) fileName += `_familia-${normalize(this.selectedFamilia)}`;
    if (this.selectedEstado) fileName += `_estado-${normalize(this.selectedEstado)}`;

    fileName += `_${new Date().toISOString().slice(0, 10)}.${extension}`;
    return fileName;
  }

  private convertToCSV(especies: Especie[]): string {
    let csvContent = '\uFEFF';
    const headers = [
      'Nombre Científico',
      'Nombre Vulgar',
      'Familia',
      'Estado de Conservación',
      'Hábitat',
      'Latitud',
      'Longitud',
      'Fecha Registro'
    ];

    csvContent += headers.join(',') + '\n';

    especies.forEach(especie => {
      const row = [
        this.escapeCsv(especie.nombre_cientifico),
        this.escapeCsv(especie.nombre_vulgar),
        this.escapeCsv(especie.familia),
        this.escapeCsv(especie.estado_conservacion),
        this.escapeCsv(especie.habitat),
        especie.coordenadas?.latitud || '',
        especie.coordenadas?.longitud || '',
        this.escapeCsv(especie.fecha_registro || '')
      ];

      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }

  private escapeCsv(value: string): string {
    if (!value) return '';
    let escaped = value.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      escaped = `"${escaped}"`;
    }
    return escaped;
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('peligro crítico')) return 'estado-critico';
    if (estadoLower.includes('peligro')) return 'estado-peligro';
    if (estadoLower.includes('vulnerable')) return 'estado-vulnerable';
    if (estadoLower.includes('preocupación menor')) return 'estado-menor';
    return 'estado-default';
  }

  trackByEspecie(index: number, especie: Especie): string {
    return especie.id || index.toString();
  }
}