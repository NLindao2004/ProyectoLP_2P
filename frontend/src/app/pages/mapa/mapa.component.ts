import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss'
})
export class MapaComponent {
  activeFilter: string = 'region';

  // Variables para los diferentes filtros
  selectedEcosistema: string = '';
  selectedRegion: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  setActiveFilter(filter: string) {
    this.activeFilter = filter;
    console.log('Filtro activo:', filter);

    // Limpiar filtros anteriores al cambiar
    this.clearFilters();
  }

  clearFilters() {
    this.selectedEcosistema = '';
    this.selectedRegion = '';
    this.fechaInicio = '';
    this.fechaFin = '';
  }

  // Métodos para manejar los filtros (implementar más tarde)
  applyEcosistemaFilter() {
    console.log('Ecosistema seleccionado:', this.selectedEcosistema);
  }

  applyRegionFilter() {
    console.log('Región seleccionada:', this.selectedRegion);
  }

  applyDateFilter() {
    console.log('Rango de fechas:', this.fechaInicio, 'a', this.fechaFin);
  }
}
