import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EspeciesService } from '../../../services/especies.service';
import { 
  Especie, 
  EspecieFormData, 
  EstadoConservacion, 
  FAMILIAS_COMUNES 
} from '../../../models/especies.model';

@Component({
  selector: 'app-especies-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especies-form.component.html',
  styleUrls: ['./especies-form.component.scss']
})
export class EspeciesFormComponent implements OnInit {
  @Input() especie: Especie | null = null;
  @Output() especieCreated = new EventEmitter<Especie>();
  @Output() especieUpdated = new EventEmitter<Especie>();
  @Output() formClosed = new EventEmitter<void>();

  // Datos del formulario
  formData: EspecieFormData = {
    nombre_cientifico: '',
    nombre_vulgar: '',
    familia: '',
    estado_conservacion: 'No evaluado',
    habitat: '',
    descripcion: '',
    latitud: 0,
    longitud: 0,
    registrado_por: 'Usuario del sistema'
  };

  // Estados del componente
  isLoading = false;
  isEditMode = false;
  errors: any = {};
  showAdvanced = false;

  // Opciones para selects
  estadosConservacion = Object.values(EstadoConservacion);
  familias = FAMILIAS_COMUNES;
  
  // Ubicaciones predefinidas de Ecuador
  ubicacionesPredefinidas = [
    { nombre: 'Quito', latitud: -0.1807, longitud: -78.4678 },
    { nombre: 'Guayaquil', latitud: -2.1894, longitud: -79.8890 },
    { nombre: 'Cuenca', latitud: -2.9001, longitud: -79.0059 },
    { nombre: 'Galápagos (Santa Cruz)', latitud: -0.7431, longitud: -90.3112 },
    { nombre: 'Manta', latitud: -0.9677, longitud: -80.7099 },
    { nombre: 'Baños', latitud: -1.3928, longitud: -78.4269 },
    { nombre: 'Otavalo', latitud: 0.2342, longitud: -78.2611 },
    { nombre: 'Tena', latitud: -1.0471, longitud: -77.8127 }
  ];

  // Habitats comunes en Ecuador
  habitatsComunes = [
    'Bosque húmedo tropical',
    'Bosque nublado',
    'Páramo',
    'Bosque seco',
    'Manglar',
    'Bosque montano',
    'Bosque amazónico',
    'Área urbana',
    'Zona costera',
    'Humedal',
    'Laguna',
    'Río',
    'Bosque piemontano'
  ];

  constructor(private especiesService: EspeciesService) {}

  ngOnInit(): void {
    this.setupForm();
  }

  private setupForm(): void {
    if (this.especie) {
      // Modo edición
      this.isEditMode = true;
      this.formData = {
        nombre_cientifico: this.especie.nombre_cientifico,
        nombre_vulgar: this.especie.nombre_vulgar,
        familia: this.especie.familia,
        estado_conservacion: this.especie.estado_conservacion,
        habitat: this.especie.habitat,
        descripcion: this.especie.descripcion || '',
        latitud: this.especie.coordenadas?.latitud || 0,
        longitud: this.especie.coordenadas?.longitud || 0,
        registrado_por: this.especie.registrado_por
      };
    } else {
      // Modo creación - valores por defecto
      this.isEditMode = false;
      this.setDefaultLocation();
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      return;
    }

    this.errors = {};
    
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.especie?.id) {
      this.updateEspecie();
    } else {
      this.createEspecie();
    }
  }

  private createEspecie(): void {
    this.especiesService.createEspecie(this.formData).subscribe({
      next: (nuevaEspecie) => {
        this.especieCreated.emit(nuevaEspecie);
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creando especie:', error);
        this.errors.general = error.message;
        this.isLoading = false;
      }
    });
  }

  private updateEspecie(): void {
    if (!this.especie?.id) return;

    this.especiesService.updateEspecie(this.especie.id, this.formData).subscribe({
      next: () => {
        this.especieUpdated.emit({ ...this.especie!, ...this.formData });
        this.closeForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error actualizando especie:', error);
        this.errors.general = error.message;
        this.isLoading = false;
      }
    });
  }

  private validateForm(): boolean {
    const errors: any = {};

    // Validaciones requeridas
    if (!this.formData.nombre_cientifico.trim()) {
      errors.nombre_cientifico = 'El nombre científico es requerido';
    }

    if (!this.formData.nombre_vulgar.trim()) {
      errors.nombre_vulgar = 'El nombre vulgar es requerido';
    }

    if (!this.formData.familia.trim()) {
      errors.familia = 'La familia es requerida';
    }

    if (!this.formData.habitat.trim()) {
      errors.habitat = 'El hábitat es requerido';
    }

    // Validación de coordenadas
    if (this.formData.latitud < -90 || this.formData.latitud > 90) {
      errors.latitud = 'La latitud debe estar entre -90 y 90';
    }

    if (this.formData.longitud < -180 || this.formData.longitud > 180) {
      errors.longitud = 'La longitud debe estar entre -180 y 180';
    }

    // Validación específica para Ecuador
    if (!this.isInEcuador(this.formData.latitud, this.formData.longitud)) {
      errors.coordenadas = 'Las coordenadas deben estar dentro del territorio ecuatoriano';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  private isInEcuador(lat: number, lng: number): boolean {
    // Límites aproximados de Ecuador (incluyendo Galápagos)
    const ecuadorBounds = {
      north: 1.5,
      south: -5.0,
      east: -75.0,
      west: -92.0
    };

    return lat >= ecuadorBounds.south && 
           lat <= ecuadorBounds.north && 
           lng >= ecuadorBounds.west && 
           lng <= ecuadorBounds.east;
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
  }

  onUbicacionChange(event: any): void {
    const ubicacionSeleccionada = this.ubicacionesPredefinidas.find(
      u => u.nombre === event.target.value
    );
    
    if (ubicacionSeleccionada) {
      this.formData.latitud = ubicacionSeleccionada.latitud;
      this.formData.longitud = ubicacionSeleccionada.longitud;
    }
  }

  onFamiliaChange(event: any): void {
    this.formData.familia = event.target.value;
  }

  onHabitatChange(event: any): void {
    this.formData.habitat = event.target.value;
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  private setDefaultLocation(): void {
    // Quito como ubicación por defecto
    this.formData.latitud = -0.1807;
    this.formData.longitud = -78.4678;
  }

  resetForm(): void {
    this.formData = {
      nombre_cientifico: '',
      nombre_vulgar: '',
      familia: '',
      estado_conservacion: 'No evaluado',
      habitat: '',
      descripcion: '',
      latitud: 0,
      longitud: 0,
      registrado_por: 'Usuario del sistema'
    };
    this.errors = {};
    this.setDefaultLocation();
  }

  closeForm(): void {
    this.formClosed.emit();
  }

  // Helpers para el template
  isFieldInvalid(fieldName: string, form: NgForm): boolean {
    const field = form.controls[fieldName];
    return field ? (field.invalid && field.touched) || !!this.errors[fieldName] : false;
  }

  getFieldError(fieldName: string): string {
    return this.errors[fieldName] || '';
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}