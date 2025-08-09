import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo.component').then(m => m.CatalogoComponent)
  },
  {
    path: 'registro-especie',  
    loadComponent: () => import('./pages/registro-especie/registro-especie.component').then(m => m.RegistroEspecieComponent)
  },
  {
    path: 'mapa',
    loadComponent: () => import('./pages/mapa/mapa.component').then(m => m.MapaComponent)
  },
  {
    path: 'registro-especie',
    loadComponent: () => import('./pages/registro-especie/registro-especie.component').then(m => m.RegistroEspecieComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
