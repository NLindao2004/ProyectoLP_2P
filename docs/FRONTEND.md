# Frontend Components Guide - Terraverde

## Project Structure
```
src/
├── app/
│   ├── components/           # UI Components
│   │   ├── home/            # Dashboard y página principal
│   │   ├── catalog/         # Catálogo de especies
│   │   ├── register-species/ # Registro de especies
│   │   ├── map/             # Mapa interactivo
│   │   ├── reports/         # Generación de reportes
│   │   ├── about/           # Información del proyecto
│   │   └── shared/          # Componentes compartidos
│   ├── services/            # Servicios Angular
│   ├── models/              # Interfaces TypeScript
│   ├── guards/              # Route guards
│   └── interceptors/        # HTTP interceptors
```

## Component Implementation Status

### ✅ HomeComponent
**Location**: `src/app/components/home/`
**Purpose**: Dashboard principal con estadísticas y vista general del sistema

**Features Implemented:**
- Statistics cards con conteo de especies
- Hero section con call-to-action
- Feature cards navegables  
- Responsive design con Angular Material
- Integration con SpeciesService para datos

**Usage:**
```typescript
// Navegación desde otros componentes
this.router.navigate(['/']);
```

### 🔄 CatalogComponent (Pending Implementation)
**Location**: `src/app/components/catalog/`
**Purpose**: Navegación y filtrado del catálogo de especies

**Planned Features:**
- Grid/lista de especies con imágenes
- Filtros avanzados (ecosistema, región, familia)
- Búsqueda por nombre científico/común
- Paginación de resultados
- Vista detalle de especie

**Implementation Template:**
```typescript
export class CatalogComponent implements OnInit {
  species: Species[] = [];
  filteredSpecies: Species[] = [];
  filters: SpeciesFilters = {};
  loading = false;
  
  constructor(
    private speciesService: SpeciesService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadSpecies();
  }
  
  loadSpecies() {
    this.loading = true;
    this.speciesService.getSpecies(this.filters).subscribe({
      next: (response) => {
        this.species = response.data;
        this.filteredSpecies = [...this.species];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading species:', error);
        this.loading = false;
      }
    });
  }
}
```

### 🔄 RegisterSpeciesComponent (Pending Implementation)
**Location**: `src/app/components/register-species/`
**Purpose**: Formulario para registro de nuevas especies

**Planned Features:**
- Formulario reactivo con validaciones
- Upload múltiple de imágenes
- Selector de ubicación con Google Maps
- Campos para clasificación taxonómica
- Preview de datos antes de envío

**Form Structure:**
```typescript
createSpeciesForm() {
  return this.fb.group({
    scientific_name: ['', [Validators.required, Validators.minLength(3)]],
    common_name: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    ecosystem: ['', [Validators.required]],
    family: ['', [Validators.required]],
    region: ['', [Validators.required]],
    latitude: [null, [Validators.required]],
    longitude: [null, [Validators.required]],
    observation_date: ['', [Validators.required]],
    images: [[]]
  });
}
```

### 🔄 MapComponent (Pending Implementation)
**Location**: `src/app/components/map/`
**Purpose**: Visualización geográfica de especies registradas

**Planned Features:**
- Google Maps integration
- Markers para ubicaciones de especies
- Clustering para múltiples especies
- Info windows con detalles
- Filtros por tipo de ecosistema

**Google Maps Setup:**
```typescript
initMap() {
  this.map = new google.maps.Map(this.mapElement.nativeElement, {
    center: { lat: -1.831239, lng: -78.183406 }, // Ecuador center
    zoom: 6,
    mapTypeId: 'hybrid'
  });
  
  this.loadSpeciesMarkers();
}

addSpeciesMarker(species: Species) {
  const marker = new google.maps.Marker({
    position: { lat: species.latitude, lng: species.longitude },
    map: this.map,
    title: species.common_name,
    icon: this.getEcosystemIcon(species.ecosystem)
  });
  
  const infoWindow = new google.maps.InfoWindow({
    content: this.createInfoWindowContent(species)
  });
  
  marker.addListener('click', () => {
    infoWindow.open(this.map, marker);
  });
}
```

### 🔄 ReportsComponent (Pending Implementation)
**Location**: `src/app/components/reports/`
**Purpose**: Generación y descarga de reportes

**Planned Features:**
- Formulario de filtros para reportes
- Preview de datos antes de generar
- Descarga en formato CSV/PDF
- Gráficos estadísticos
- Historial de reportes generados

**Report Generation:**
```typescript
generateReport(format: 'csv' | 'pdf') {
  this.loading = true;
  
  this.reportService.generateReport(this.reportFilters, format).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `especies_reporte_${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.loading = false;
    },
    error: (error) => {
      this.snackBar.open('Error generando reporte', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.loading = false;
    }
  });
}
```

### 🔄 AboutComponent (Pending Implementation)
**Location**: `src/app/components/about/`
**Purpose**: Información del proyecto y equipo

**Planned Features:**
- Información del proyecto Terraverde
- Objetivos y misión
- Información de contacto
- Enlaces a recursos externos

## Shared Components

### Navigation Component
**Location**: `src/app/components/shared/navigation/`
**Purpose**: Barra de navegación principal

**Features:**
- Responsive drawer navigation
- Active route highlighting
- User menu (when authenticated)
- PWA install prompt

### Loading Component
**Location**: `src/app/components/shared/loading/`
**Purpose**: Indicador de carga reutilizable

```typescript
@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-container" *ngIf="loading">
      <mat-spinner diameter="50"></mat-spinner>
      <p>{{ message }}</p>
    </div>
  `
})
export class LoadingComponent {
  @Input() loading = false;
  @Input() message = 'Cargando...';
}
```

### Species Card Component
**Location**: `src/app/components/shared/species-card/`
**Purpose**: Tarjeta reutilizable para mostrar especies

```html
<mat-card class="species-card" (click)="onCardClick()">
  <mat-card-header>
    <mat-card-title>{{ species.common_name }}</mat-card-title>
    <mat-card-subtitle>{{ species.scientific_name }}</mat-card-subtitle>
  </mat-card-header>
  
  <img mat-card-image [src]="species.images[0]" [alt]="species.common_name">
  
  <mat-card-content>
    <p>{{ species.description | slice:0:100 }}...</p>
    
    <div class="species-tags">
      <mat-chip>{{ species.ecosystem }}</mat-chip>
      <mat-chip>{{ species.family }}</mat-chip>
      <mat-chip>{{ species.region }}</mat-chip>
    </div>
  </mat-card-content>
  
  <mat-card-actions>
    <button mat-button (click)="viewDetails()">VER DETALLES</button>
    <button mat-button (click)="showOnMap()">VER EN MAPA</button>
  </mat-card-actions>
</mat-card>
```

## Routing Configuration

### Current Routes
```typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'register', component: RegisterSpeciesComponent },
  { path: 'map', component: MapComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];
```

### Guards Implementation
```typescript
// auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  
  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}
```

## State Management

### Service-Based State
```typescript
// app-state.service.ts
@Injectable({ providedIn: 'root' })
export class AppStateService {
  private speciesSubject = new BehaviorSubject<Species[]>([]);
  private filtersSubject = new BehaviorSubject<SpeciesFilters>({});
  
  species$ = this.speciesSubject.asObservable();
  filters$ = this.filtersSubject.asObservable();
  
  updateSpecies(species: Species[]) {
    this.speciesSubject.next(species);
  }
  
  updateFilters(filters: SpeciesFilters) {
    this.filtersSubject.next(filters);
  }
}
```

## Material Design Implementation

### Theme Configuration
```scss
// src/styles.scss
@import '~@angular/material/theming';

$primary: mat-palette($mat-green, 600);
$accent: mat-palette($mat-blue, 500);
$warn: mat-palette($mat-red);

$theme: mat-light-theme((
  color: (
    primary: $primary,
    accent: $accent,
    warn: $warn,
  )
));

@include mat-core-theme($theme);
@include mat-all-component-themes($theme);
```

### Responsive Breakpoints
```scss
$mobile: 'screen and (max-width: 767px)';
$tablet: 'screen and (min-width: 768px) and (max-width: 1023px)';
$desktop: 'screen and (min-width: 1024px)';

.species-grid {
  display: grid;
  gap: 16px;
  
  @media #{$mobile} {
    grid-template-columns: 1fr;
  }
  
  @media #{$tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media #{$desktop} {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## PWA Features

### Service Worker Configuration
```typescript
// src/app/app.module.ts
imports: [
  ServiceWorkerModule.register('ngsw-worker.js', {
    enabled: environment.production,
    registrationStrategy: 'registerWhenStable:30000'
  })
]
```

### Update Notifications
```typescript
// src/app/services/pwa.service.ts
@Injectable({ providedIn: 'root' })
export class PwaService {
  constructor(
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar
  ) {
    if (swUpdate.isEnabled) {
      swUpdate.available.subscribe(() => {
        this.promptUpdate();
      });
    }
  }
  
  private promptUpdate() {
    const snackBarRef = this.snackBar.open(
      'Nueva versión disponible',
      'Actualizar',
      { duration: 6000 }
    );
    
    snackBarRef.onAction().subscribe(() => {
      window.location.reload();
    });
  }
}
```

## Next Steps

### Immediate Priority
1. **Complete CatalogComponent** - Species listing and filtering
2. **Implement RegisterSpeciesComponent** - Species registration form
3. **Add MapComponent** - Google Maps integration
4. **Create ReportsComponent** - Report generation

### Testing Strategy
```typescript
// catalog.component.spec.ts
describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let speciesService: jasmine.SpyObj<SpeciesService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('SpeciesService', ['getSpecies']);
    
    TestBed.configureTestingModule({
      declarations: [CatalogComponent],
      providers: [{ provide: SpeciesService, useValue: spy }]
    });
    
    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    speciesService = TestBed.inject(SpeciesService) as jasmine.SpyObj<SpeciesService>;
  });
  
  it('should load species on init', () => {
    const mockSpecies = [{ id: '1', common_name: 'Test Species' }];
    speciesService.getSpecies.and.returnValue(of({ data: mockSpecies }));
    
    component.ngOnInit();
    
    expect(speciesService.getSpecies).toHaveBeenCalled();
    expect(component.species).toEqual(mockSpecies);
  });
});
```

### Performance Optimization
- Lazy loading para componentes grandes
- Virtual scrolling para listas extensas
- Image lazy loading y optimization
- OnPush change detection strategy
