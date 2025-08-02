import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    //loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'catalog',
    //loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'register',
    //loadComponent: () => import('./pages/register-species/register-species.component').then(m => m.RegisterSpeciesComponent)
  },
  {
    path: 'species/:id',
    //loadComponent: () => import('./pages/species-detail/species-detail.component').then(m => m.SpeciesDetailComponent)
  },
  {
    path: 'map',
    //loadComponent: () => import('./pages/map/map.component').then(m => m.MapComponent)
  },
  {
    path: 'reports',
    //loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'about',
    //loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
