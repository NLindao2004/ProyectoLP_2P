import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspeciesListComponent } from '../../components/especies/especies-list/especies-list.component';
import { EspeciesService } from '../../services/especies.service';
import { Especie } from '../../models/especies.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, EspeciesListComponent],
  template: `
    <div class="catalogo-container">
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
        <app-especies-list></app-especies-list>
      </section>
    </div>
  `,
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {
  totalEspecies = 0;
  totalFamilias = 0;

  constructor(private especiesService: EspeciesService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.especiesService.especies$.subscribe(especies => {
      this.totalEspecies = especies.length;
      this.totalFamilias = new Set(especies.map(e => e.familia)).size;
    });
  }
}