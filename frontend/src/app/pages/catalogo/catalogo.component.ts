import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EspeciesListComponent } from '../../components/especies/especies-list/especies-list.component';
import { EspeciesService } from '../../services/especies.service';
import { Especie } from '../../models/especies.model';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, EspeciesListComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="catalogo-container">
      <!-- Mensaje de éxito/error -->
      <div *ngIf="message" class="alert alert-success">
        {{ message }}
      </div>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>🌿 Catálogo de Especies de Ecuador</h1>
          <p class="hero-description">
            Explora la increíble biodiversidad del Ecuador, desde los bosques amazónicos 
            hasta las islas Galápagos. Descubre, registra y conserva nuestra riqueza natural.
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">{{ totalEspecies }}</span>
              <span class="stat-label">Especies registradas</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ totalFamilias }}</span>
              <span class="stat-label">Familias</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">4</span>
              <span class="stat-label">Regiones</span>
            </div>
          </div>
          
          <!-- Botón Nueva Especie -->
          <div class="hero-actions">
            <button 
              type="button" 
              class="btn btn-primary btn-large"
              (click)="onNuevaEspecie()">
              🌿 Registrar Nueva Especie
            </button>
          </div>
        </div>
        <div class="hero-image">
          <div class="floating-icon">🦜</div>
          <div class="floating-icon">🌺</div>
          <div class="floating-icon">🐸</div>
          <div class="floating-icon">🦋</div>
        </div>
      </section>

      <!-- Lista de Especies -->
      <section class="especies-section">
        <app-especies-list 
          (editEspecie)="onEditEspecie($event)">
        </app-especies-list>
      </section>
    </div>
  `,
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {
  totalEspecies = 0;
  totalFamilias = 0;
  message = '';

  constructor(
    private especiesService: EspeciesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.checkForMessages();
  }

  private loadStats(): void {
    this.especiesService.especies$.subscribe(especies => {
      this.totalEspecies = especies.length;
      this.totalFamilias = new Set(especies.map(e => e.familia)).size;
    });
  }

  private checkForMessages(): void {
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.message = params['message'];
        // Clear message after 5 seconds
        setTimeout(() => {
          this.message = '';
          // Remove query params from URL
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
          });
        }, 5000);
      }
    });
  }

  onNuevaEspecie(): void {
    this.router.navigate(['/registro-especie']);
  }

  // Corregir el tipo del parámetro
  onEditEspecie(especie: Especie): void {
    this.router.navigate(['/editar-especie', especie.id]);
  }
}