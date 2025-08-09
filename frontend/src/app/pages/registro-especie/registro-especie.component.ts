import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EspeciesFormComponent } from '../../components/especies/especies-form/especies-form.component';
import { Especie } from '../../models/especies.model';

@Component({
  selector: 'app-registro-especie',
  standalone: true,
  imports: [CommonModule, EspeciesFormComponent],
  template: `
    <div class="registro-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button class="btn-back" (click)="goBack()">
            ← Volver al catálogo
          </button>
          <h1>🌿 Registrar Nueva Especie</h1>
          <p class="page-description">
            Contribuye al conocimiento de la biodiversidad ecuatoriana registrando 
            una nueva especie en nuestro catálogo científico.
          </p>
        </div>
      </div>

      <!-- Formulario -->
      <div class="form-container">
        <app-especies-form
          [especie]="null"
          (especieCreated)="onEspecieCreated($event)"
          (formClosed)="goBack()">
        </app-especies-form>
      </div>

      <!-- Información adicional -->
      <div class="info-section">
        <div class="info-card">
          <h3>💡 Consejos para el registro</h3>
          <ul>
            <li>Asegúrate de que el nombre científico sea correcto</li>
            <li>Proporciona coordenadas precisas de la ubicación</li>
            <li>Incluye una descripción detallada de las características</li>
            <li>Especifica el hábitat donde fue encontrada</li>
          </ul>
        </div>
        
        <div class="info-card">
          <h3>📊 Importancia del registro</h3>
          <p>
            Cada especie registrada contribuye al conocimiento científico y 
            ayuda en los esfuerzos de conservación de la biodiversidad ecuatoriana.
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./registro-especie.component.scss']
})
export class RegistroEspecieComponent {
  
  constructor(private router: Router) {}

  onEspecieCreated(especie: Especie): void {
    console.log('Nueva especie creada:', especie);
    
    // Mostrar mensaje de éxito
    alert(`¡Especie "${especie.nombre_vulgar}" registrada exitosamente!`);
    
    // Redirigir al catálogo
    this.router.navigate(['/catalogo']);
  }

  goBack(): void {
    this.router.navigate(['/catalogo']);
  }
}