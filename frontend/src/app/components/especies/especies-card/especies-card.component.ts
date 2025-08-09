import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Especie } from '../../../models/especies.model';

@Component({
  selector: 'app-especies-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './especies-card.component.html',
  styleUrls: ['./especies-card.component.scss']
})
export class EspeciesCardComponent {
  @Input() especie!: Especie;
  @Input() isSelected = false;
  @Input() isHighlighted = false;
  
  @Output() especieSelected = new EventEmitter<Especie>();
  @Output() especieEdit = new EventEmitter<Especie>();
  @Output() especieDelete = new EventEmitter<Especie>();
  @Output() especieViewMap = new EventEmitter<Especie>();
  @Output() especieView = new EventEmitter<Especie>();

  onCardClick(): void {
    this.especieSelected.emit(this.especie);
  }

  onView(): void {
    this.especieView.emit(this.especie);
  }

  onEdit(): void {
    this.especieEdit.emit(this.especie);
  }

  onDelete(): void {
    this.especieDelete.emit(this.especie);
  }

  onViewMap(): void {
    if (this.hasValidCoordinates()) {
      this.especieViewMap.emit(this.especie);
    }
  }

  hasValidCoordinates(): boolean {
    return !!(this.especie.coordenadas && 
              this.especie.coordenadas.latitud !== 0 && 
              this.especie.coordenadas.longitud !== 0);
  }

  getShortDescription(): string {
    if (!this.especie.descripcion) return '';
    return this.especie.descripcion.length > 100 
      ? this.especie.descripcion.substring(0, 100)
      : this.especie.descripcion;
  }

  getEstadoClass(): string {
    const estado = this.especie.estado_conservacion.toLowerCase();
    
    if (estado.includes('peligro crítico')) return 'estado-critico';
    if (estado.includes('peligro')) return 'estado-peligro';
    if (estado.includes('vulnerable')) return 'estado-vulnerable';
    if (estado.includes('preocupación menor')) return 'estado-menor';
    
    return 'estado-default';
  }
}