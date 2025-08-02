import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { SpeciesService } from '../../services/species.service';
import { SpeciesStatistics } from '../../models/species.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <mat-card class="hero-card">
          <mat-card-content>
            <div class="hero-content">
              <div class="hero-text">
                <h1>
                  <mat-icon class="hero-icon">eco</mat-icon>
                  Bienvenido a Terraverde
                </h1>
                <p class="hero-description">
                  Plataforma de catalogación y registro de especies en ecosistemas terrestres y acuáticos de Ecuador.
                  Documenta la biodiversidad de bosques, lagos y playas con herramientas modernas y científicas.
                </p>
                <div class="hero-actions">
                  <button mat-raised-button color="primary" routerLink="/register">
                    <mat-icon>add_circle</mat-icon>
                    Registrar Especie
                  </button>
                  <button mat-stroked-button routerLink="/catalog">
                    <mat-icon>view_list</mat-icon>
                    Ver Catálogo
                  </button>
                </div>
              </div>
              <div class="hero-image">
                <mat-icon class="large-icon">nature</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="stats-section" *ngIf="statistics">
        <h2>Estadísticas del Sistema</h2>
        <mat-grid-list cols="4" rowHeight="120px" gutterSize="16px" class="stats-grid">
          <mat-grid-tile>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon total">bug_report</mat-icon>
                  <div class="stat-text">
                    <h3>{{ statistics.totalSpecies }}</h3>
                    <p>Especies Registradas</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>
          
          <mat-grid-tile>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon forest">park</mat-icon>
                  <div class="stat-text">
                    <h3>{{ statistics.byEcosystem.forest }}</h3>
                    <p>Bosques</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>
          
          <mat-grid-tile>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon lake">waves</mat-icon>
                  <div class="stat-text">
                    <h3>{{ statistics.byEcosystem.lake }}</h3>
                    <p>Lagos</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>
          
          <mat-grid-tile>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon beach">beach_access</mat-icon>
                  <div class="stat-text">
                    <h3>{{ statistics.byEcosystem.beach }}</h3>
                    <p>Playas</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>
      </div>

      <div class="features-section">
        <h2>Funcionalidades Principales</h2>
        <div class="features-grid">
          <mat-card class="feature-card" routerLink="/register">
            <mat-card-content>
              <mat-icon class="feature-icon">add_a_photo</mat-icon>
              <h3>Registro de Especies</h3>
              <p>Documenta especies con fotografías, ubicación GPS y datos científicos completos.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="feature-card" routerLink="/catalog">
            <mat-card-content>
              <mat-icon class="feature-icon">search</mat-icon>
              <h3>Catálogo Interactivo</h3>
              <p>Explora y filtra especies por ecosistema, familia, región y características.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="feature-card" routerLink="/map">
            <mat-card-content>
              <mat-icon class="feature-icon">map</mat-icon>
              <h3>Mapas Interactivos</h3>
              <p>Visualiza ubicaciones de avistamientos en mapas dinámicos con Google Maps.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="feature-card" routerLink="/reports">
            <mat-card-content>
              <mat-icon class="feature-icon">assessment</mat-icon>
              <h3>Reportes Científicos</h3>
              <p>Genera reportes en CSV y PDF con análisis estadísticos detallados.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .hero-section {
      margin-bottom: 48px;
    }

    .hero-card {
      background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
      color: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
    }

    .hero-content {
      display: flex;
      align-items: center;
      gap: 32px;
      padding: 32px;
    }

    .hero-text {
      flex: 2;
    }

    .hero-image {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hero-text h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 2.5em;
      font-weight: 500;
      margin: 0 0 16px 0;
    }

    .hero-icon {
      font-size: 48px;
      color: #A5D6A7;
    }

    .hero-description {
      font-size: 1.1em;
      line-height: 1.6;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .hero-actions button {
      padding: 12px 24px;
      font-size: 1em;
    }

    .large-icon {
      font-size: 120px;
      color: rgba(255, 255, 255, 0.3);
    }

    .stats-section {
      margin-bottom: 48px;
    }

    .stats-section h2 {
      text-align: center;
      margin-bottom: 24px;
      color: #2E7D32;
      font-weight: 500;
    }

    .stats-grid {
      margin-bottom: 16px;
    }

    .stat-card {
      width: 100%;
      height: 100%;
      cursor: default;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 100%;
    }

    .stat-icon {
      font-size: 32px;
      
      &.total { color: #4CAF50; }
      &.forest { color: #2E7D32; }
      &.lake { color: #2196F3; }
      &.beach { color: #FF9800; }
    }

    .stat-text h3 {
      margin: 0;
      font-size: 1.8em;
      font-weight: 600;
      color: #333;
    }

    .stat-text p {
      margin: 4px 0 0 0;
      font-size: 0.9em;
      color: #666;
    }

    .features-section h2 {
      text-align: center;
      margin-bottom: 32px;
      color: #2E7D32;
      font-weight: 500;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .feature-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 12px;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      }
    }

    .feature-card mat-card-content {
      text-align: center;
      padding: 32px 24px;
    }

    .feature-icon {
      font-size: 48px;
      color: #4CAF50;
      margin-bottom: 16px;
      display: block;
    }

    .feature-card h3 {
      margin: 0 0 12px 0;
      color: #2E7D32;
      font-weight: 500;
    }

    .feature-card p {
      color: #666;
      line-height: 1.5;
      margin: 0;
    }

    @media (max-width: 768px) {
      .hero-content {
        flex-direction: column;
        text-align: center;
        padding: 24px;
      }

      .hero-text h1 {
        font-size: 2em;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .hero-actions {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  statistics: SpeciesStatistics | null = null;

  constructor(private speciesService: SpeciesService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  private loadStatistics() {
    this.speciesService.getStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.statistics = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        // Datos de demostración si no se pueden cargar las estadísticas
        this.statistics = {
          totalSpecies: 0,
          byEcosystem: { forest: 0, lake: 0, beach: 0 },
          byFamily: {},
          byRegion: {},
          recentAdditions: []
        };
      }
    });
  }
}
