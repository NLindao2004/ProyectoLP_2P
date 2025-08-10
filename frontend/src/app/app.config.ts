import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // ⭐ AGREGAR ESTA LÍNEA

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { GoogleMapsModule } from '@angular/google-maps';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(GoogleMapsModule),
    provideHttpClient(),  // ⭐ AGREGAR ESTA LÍNEA
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};