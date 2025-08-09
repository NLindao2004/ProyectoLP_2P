import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EspeciesService } from '../../../services/especies.service';
import { Especie } from '../../../models/especies.model';
import { EspeciesFormComponent } from '../especies-form/especies-form.component';

@Component({
  selector: 'app-especies-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EspeciesFormComponent],
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
  
  // Estado del formulario
  showCreateForm = false;
  
  // Estadísticas
  totalEspecies = 0;
  
  private destroy$ = new Subject<void>();

  constructor(private especiesService: EspeciesService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Suscribirse a las especies
    this.especiesService.especies$
      .pipe(takeUntil(this.destroy$))
      .subscribe(especies => {
        this.especies = especies;
        this.especiesFiltradas = especies;
        this.totalEspecies = especies.length;
        this.updateFamilias();
        this.applyFilters();
      });

    // Suscribirse al estado de carga
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

    // Filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(especie =>
        especie.nombre_cientifico.toLowerCase().includes(term) ||
        especie.nombre_vulgar.toLowerCase().includes(term) ||
        especie.familia.toLowerCase().includes(term) ||
        especie.habitat.toLowerCase().includes(term)
      );
    }

    // Filtro por familia
    if (this.selectedFamilia) {
      filtered = filtered.filter(especie => especie.familia === this.selectedFamilia);
    }

    // Filtro por estado
    if (this.selectedEstado) {
      filtered = filtered.filter(especie => especie.estado_conservacion === this.selectedEstado);
    }

    this.especiesFiltradas = filtered;
  }

  selectEspecie(especie: Especie): void {
    this.selectedEspecie = this.selectedEspecie?.id === especie.id ? null : especie;
  }

  editEspecie(especie: Especie): void {
    // TODO: Implementar edición
    console.log('Editar especie:', especie);
  }

  deleteEspecie(especie: Especie): void {
    if (confirm(`¿Estás seguro de eliminar "${especie.nombre_vulgar}"?`)) {
      this.especiesService.deleteEspecie(especie.id!).subscribe({
        next: () => {
          console.log('Especie eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error eliminando especie:', error);
          alert('Error al eliminar la especie: ' + error.message);
        }
      });
    }
  }

  viewOnMap(especie: Especie): void {
    // TODO: Integrar con componente de mapa
    console.log('Ver en mapa:', especie);
  }

  refreshData(): void {
    this.especiesService.refreshData();
  }

  onEspecieCreated(especie: Especie): void {
    this.showCreateForm = false;
    console.log('Nueva especie creada:', especie);
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