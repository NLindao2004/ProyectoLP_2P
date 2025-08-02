import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  appName = environment.app.name;
  appDescription = environment.app.description;
  updateAvailable = false;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    this.checkForUpdates();
  }

  toggleSidenav() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  private checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable = true;
        }
      });
      
      // Verificar actualizaciones periódicamente
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, environment.pwa.updateCheckInterval);
    }
  }

  updateApp() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        window.location.reload();
      });
    }
  }
}
