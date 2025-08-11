import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspeciesFormComponent } from '../../components/especies/especies-form/especies-form.component';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-registro-especie',
  standalone: true,
  imports: [CommonModule, EspeciesFormComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="registro-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>🌿 Registrar Nueva Especie</h1>
          <p class="page-description">
            Contribuye al conocimiento de la biodiversidad ecuatoriana registrando 
            una nueva especie en nuestro catálogo científico.
          </p>
        </div>
      </div>

      <!-- Formulario - ✅ SIN inputs/outputs -->
      <div class="form-container">
        <app-especies-form></app-especies-form>
      </div>

      <!-- Información adicional -->
      <div class="info-section">
        <div class="info-card">
          <h3>💡 Consejos para el registro</h3>
          <ul>
            <li>Asegúrate de que el nombre científico sea correcto</li>
            <li>Proporciona coordenadas precisas de la ubicación</li>
            <li>Incluye al menos una imagen de buena calidad</li>
            <li>Especifica el hábitat donde fue encontrada</li>
            <li>Describe características distintivas de la especie</li>
          </ul>
        </div>
        
        <div class="info-card">
          <h3>📊 Importancia del registro</h3>
          <p>
            Cada especie registrada contribuye al conocimiento científico y 
            ayuda en los esfuerzos de conservación de la biodiversidad ecuatoriana.
          </p>
        </div>

        <div class="info-card">
          <h3>📷 Imágenes requeridas</h3>
          <p>
            Es obligatorio subir <strong>mínimo 1 imagen</strong> y máximo 5. 
            Las imágenes deben ser claras y mostrar características identificativas 
            de la especie.
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./registro-especie.component.scss']
})
export class RegistroEspecieComponent {
  // ❌ ELIMINAR: Ya no necesitamos Router ni métodos
  // El EspeciesFormComponent maneja su propia navegación
}