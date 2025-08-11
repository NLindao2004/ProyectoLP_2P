import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // ⭐ AGREGAR
import { HeaderComponent } from '../header/header.component'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  
  constructor(private router: Router) {}  // ⭐ INYECTAR ROUTER

  // Navegación a catálogo
  navigateToCatalogo(): void {
    this.router.navigate(['/catalogo']);
  }

  // Navegación a registro
  navigateToRegistro(): void {
    this.router.navigate(['/registro-especie']);
  }

  // Navegación a mapa (opcional)
  navigateToMapa(): void {
    this.router.navigate(['/mapa']);
  }
}