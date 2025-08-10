import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EspeciesService } from '../../../services/especies.service';
import { 
  Especie, 
  EspecieFormData, 
  EstadoConservacion, 
  FAMILIAS_COMUNES 
} from '../../../models/especies.model';

// Interfaz para las imágenes seleccionadas
interface SelectedImage {
  file?: File;           // Para nuevas imágenes
  preview: string;       // URL de preview
  url?: string;          // Para imágenes existentes
  id?: string;           // ID de imagen existente
  isExisting?: boolean;  // Flag para identificar imágenes existentes
  name?: string;         // Nombre del archivo
}

@Component({
  selector: 'app-especies-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especies-form.component.html',
  styleUrls: ['./especies-form.component.scss']
})
export class EspeciesFormComponent implements OnInit {
  especie: Especie | null = null;

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

  // ✅ MODIFICAR: Propiedades para manejo de imágenes existentes
  selectedImages: SelectedImage[] = [];
  existingImages: SelectedImage[] = []; // Imágenes originales de la especie
  imagesToDelete: string[] = []; // IDs de imágenes a eliminar
  maxImages = 5;
  minImages = 1;
  maxFileSize = 5 * 1024 * 1024; // 5MB en bytes

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

  constructor(
    private especiesService: EspeciesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode based on route params
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadEspecieForEdit(params['id']);
      } else {
        this.setupForm();
      }
    });
  }

  private loadEspecieForEdit(id: string): void {
    this.especiesService.getEspecieById(id).subscribe({
      next: (especie) => {
        this.especie = especie;
        this.setupForm();
      },
      error: (error) => {
        console.error('Error loading especie:', error);
        this.errors.general = 'Error al cargar la especie para editar';
        // Redirect to catalog if especie not found
        this.router.navigate(['/catalogo']);
      }
    });
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

      // ✅ AGREGAR: Cargar imágenes existentes
      this.loadExistingImages();
    } else {
      // Modo creación - valores por defecto
      this.isEditMode = false;
      this.setDefaultLocation();
    }
  }

  // ✅ AGREGAR: Método para cargar imágenes existentes
  private loadExistingImages(): void {
    if (this.especie?.imagenes && this.especie.imagenes.length > 0) {
      console.log('Cargando imágenes existentes:', this.especie.imagenes);
      
      this.existingImages = this.especie.imagenes.map(imagen => ({
        preview: imagen.url,
        url: imagen.url,
        id: imagen.id,
        isExisting: true,
        name: imagen.nombre || 'Imagen existente'
      }));
      
      // Copiar a selectedImages para mostrar en el preview
      this.selectedImages = [...this.existingImages];
      
      console.log('Imágenes cargadas:', this.selectedImages.length);
    } else {
      console.log('No hay imágenes existentes para cargar');
      this.selectedImages = [];
      this.existingImages = [];
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
    // Crear FormData para enviar archivos
    const formData = new FormData();
    
    // Agregar datos del formulario (excepto latitud y longitud)
    Object.keys(this.formData).forEach(key => {
      if (key !== 'latitud' && key !== 'longitud') {
        const value = this.formData[key as keyof EspecieFormData];
        formData.append(key, value?.toString() ?? '');
      }
    });

    // Agregar latitud y longitud explícitamente como string
    formData.append(
      'latitud',
      (typeof this.formData.latitud === 'number' ? this.formData.latitud : Number(this.formData.latitud)).toFixed(4)
    );
    formData.append(
      'longitud',
      (typeof this.formData.longitud === 'number' ? this.formData.longitud : Number(this.formData.longitud)).toFixed(4)
    );
    // Agregar imágenes nuevas
    const newImages = this.selectedImages.filter(img => img.file && !img.isExisting);
    newImages.forEach((img) => {
      if (img.file) {
        formData.append('imagenes[]', img.file);
      }
    });


    console.log('Creando especie con', newImages.length, 'imágenes');

    this.especiesService.createEspecieWithImages(formData).subscribe({
      next: (nuevaEspecie) => {
        this.router.navigate(['/catalogo'], { 
          queryParams: { message: 'Especie creada exitosamente' }
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creando especie:', error);
        this.errors.general = error.message || 'Error al crear la especie';
        this.isLoading = false;
      }
    });
  }

  private updateEspecie(): void {
    if (!this.especie?.id) return;

    const formData = new FormData();

    // Agregar datos del formulario (excepto latitud y longitud)
    Object.keys(this.formData).forEach(key => {
      if (key !== 'latitud' && key !== 'longitud') {
        const value = this.formData[key as keyof EspecieFormData];
        formData.append(key, value?.toString() ?? '');
      }
    });

    // Agregar latitud y longitud explícitamente como string (4 decimales)
    formData.append(
      'latitud',
      (typeof this.formData.latitud === 'number' ? this.formData.latitud : Number(this.formData.latitud)).toFixed(4)
    );
    formData.append(
      'longitud',
      (typeof this.formData.longitud === 'number' ? this.formData.longitud : Number(this.formData.longitud)).toFixed(4)
    );

    // Agregar imágenes nuevas
    const newImages = this.selectedImages.filter(img => img.file && !img.isExisting);
    newImages.forEach((img) => {
      if (img.file) {
        formData.append('imagenes[]', img.file);
      }
    });

    // Agregar IDs de imágenes a eliminar
    if (this.imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(this.imagesToDelete));
    }

    // Agregar IDs de imágenes existentes que se mantienen
    const keepingImages = this.selectedImages
      .filter(img => img.isExisting && img.id)
      .map(img => img.id);

    if (keepingImages.length > 0) {
      formData.append('keepingImages', JSON.stringify(keepingImages));
    }

    console.log('Actualizando especie:', {
      nuevasImagenes: newImages.length,
      imagenesAEliminar: this.imagesToDelete.length,
      imagenesQueSeQuedan: keepingImages.length
    });

    this.especiesService.updateEspecieWithImages(this.especie.id, formData).subscribe({
      next: () => {
        this.router.navigate(['/catalogo'], { 
          queryParams: { message: 'Especie actualizada exitosamente' }
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error actualizando especie:', error);
        this.errors.general = error.message || 'Error al actualizar la especie';
        this.isLoading = false;
      }
    });
  }

  // ✅ AGREGAR: Método para seleccionar archivos
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }

    // Validar cantidad total de imágenes
    if (this.selectedImages.length + files.length > this.maxImages) {
      this.errors.images = `Máximo ${this.maxImages} imágenes permitidas`;
      return;
    }

    // Procesar cada archivo
    Array.from(files).forEach(file => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.errors.images = 'Solo se permiten archivos de imagen';
        return;
      }

      // Validar tamaño de archivo
      if (file.size > this.maxFileSize) {
        this.errors.images = `El archivo ${file.name} es muy grande. Máximo 5MB por imagen`;
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push({
          file: file,
          preview: e.target.result,
          isExisting: false,
          name: file.name
        });

        // Limpiar errores si todo está bien
        if (this.selectedImages.length >= this.minImages) {
          delete this.errors.images;
        }
      };
      reader.readAsDataURL(file);
    });

    // Limpiar el input file
    event.target.value = '';
  }

  // ✅ MODIFICAR: Método para remover imágenes
  removeImage(index: number): void {
    const imageToRemove = this.selectedImages[index];
    
    console.log('Removiendo imagen:', imageToRemove);
    
    // Si es una imagen existente, agregarla a la lista de eliminación
    if (imageToRemove.isExisting && imageToRemove.id) {
      this.imagesToDelete.push(imageToRemove.id);
      console.log('Marcada para eliminar:', imageToRemove.id);
    }
    
    // Remover de selectedImages
    this.selectedImages.splice(index, 1);
    
    // Validar cantidad mínima
    if (this.selectedImages.length < this.minImages) {
      this.errors.images = `Mínimo ${this.minImages} imagen requerida`;
    } else {
      delete this.errors.images;
    }
  }

  // ✅ MODIFICAR: Validación para incluir imágenes en modo edición
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

    // ✅ VALIDACIÓN: Mínimo de imágenes (solo en modo creación o si no hay imágenes existentes)
    if (!this.isEditMode || this.selectedImages.length === 0) {
      if (this.selectedImages.length < this.minImages) {
        errors.images = `Mínimo ${this.minImages} imagen requerida`;
      }
    }

    if (this.selectedImages.length > this.maxImages) {
      errors.images = `Máximo ${this.maxImages} imágenes permitidas`;
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

  closeForm(): void {
    // Navigate back to catalog instead of emitting event
    this.router.navigate(['/catalogo']);
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
    this.selectedImages = [];
    this.existingImages = [];
    this.imagesToDelete = [];
    this.setDefaultLocation();
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