# Testing Guide - Terraverde Project

## Testing Strategy Overview

### Testing Pyramid
```
    /\     E2E Tests (Cypress)
   /  \    Integration Tests (Angular Testing)  
  /____\   Unit Tests (Jasmine/Karma)
```

### Test Coverage Goals
- **Unit Tests**: >80% code coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Main application workflows

## Frontend Testing (Angular)

### Setup and Configuration

#### Test Environment Setup
```typescript
// src/test.ts
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
```

#### Karma Configuration
```javascript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-headless'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/terraverde-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ]
    },
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};
```

### Unit Tests

#### Service Testing
```typescript
// src/app/services/species.service.spec.ts
describe('SpeciesService', () => {
  let service: SpeciesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SpeciesService]
    });
    
    service = TestBed.inject(SpeciesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch species list', () => {
    const mockSpecies: Species[] = [
      {
        id: '1',
        scientific_name: 'Panthera onca',
        common_name: 'Jaguar',
        description: 'Large cat species',
        ecosystem: 'forest',
        family: 'Felidae',
        region: 'Amazonia',
        latitude: -2.1833,
        longitude: -77.8833,
        images: ['image1.jpg'],
        observation_date: '2024-08-01',
        created_at: '2024-08-02T10:30:00Z'
      }
    ];

    service.getSpecies().subscribe(response => {
      expect(response.data).toEqual(mockSpecies);
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/species`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockSpecies });
  });

  it('should handle filters correctly', () => {
    const filters: SpeciesFilters = {
      ecosystem: 'forest',
      region: 'Amazonia'
    };

    service.getSpecies(filters).subscribe();

    const req = httpMock.expectOne(
      `${service.apiUrl}/species?ecosystem=forest&region=Amazonia`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should create new species', () => {
    const formData = new FormData();
    formData.append('scientific_name', 'Test Species');
    formData.append('common_name', 'Test');

    const mockResponse = { success: true, data: { id: '123' } };

    service.createSpecies(formData).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('123');
    });

    const req = httpMock.expectOne(`${service.apiUrl}/species`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    req.flush(mockResponse);
  });

  it('should handle errors gracefully', () => {
    service.getSpecies().subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(`${service.apiUrl}/species`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

#### Component Testing
```typescript
// src/app/components/home/home.component.spec.ts
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let speciesService: jasmine.SpyObj<SpeciesService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const speciesServiceSpy = jasmine.createSpyObj('SpeciesService', ['getStatistics']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SpeciesService, useValue: speciesServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    speciesService = TestBed.inject(SpeciesService) as jasmine.SpyObj<SpeciesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load statistics on init', () => {
    const mockStats = {
      total_species: 150,
      by_ecosystem: { forest: 80, lake: 45, beach: 25 },
      by_family: { Felidae: 15 },
      by_region: { Amazonia: 60 }
    };

    speciesService.getStatistics.and.returnValue(
      of({ success: true, data: mockStats })
    );

    component.ngOnInit();

    expect(speciesService.getStatistics).toHaveBeenCalled();
    expect(component.statistics).toEqual(mockStats);
    expect(component.loading).toBe(false);
  });

  it('should navigate to catalog when clicked', () => {
    component.navigateTo('catalog');
    expect(router.navigate).toHaveBeenCalledWith(['/catalog']);
  });

  it('should display loading state', () => {
    component.loading = true;
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.loading'));
    expect(loadingElement).toBeTruthy();
  });

  it('should display statistics cards', fakeAsync(() => {
    const mockStats = {
      total_species: 150,
      by_ecosystem: { forest: 80 },
      by_family: { Felidae: 15 },
      by_region: { Amazonia: 60 }
    };

    speciesService.getStatistics.and.returnValue(
      of({ success: true, data: mockStats })
    );

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const statsCards = fixture.debugElement.queryAll(By.css('.stat-card'));
    expect(statsCards.length).toBe(4);

    const totalSpeciesCard = statsCards[0];
    expect(totalSpeciesCard.nativeElement.textContent).toContain('150');
  }));
});
```

#### Form Testing
```typescript
// src/app/components/register-species/register-species.component.spec.ts
describe('RegisterSpeciesComponent', () => {
  let component: RegisterSpeciesComponent;
  let fixture: ComponentFixture<RegisterSpeciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterSpeciesComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterSpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with default values', () => {
    expect(component.speciesForm).toBeDefined();
    expect(component.speciesForm.get('scientific_name')?.value).toBe('');
    expect(component.speciesForm.get('ecosystem')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.speciesForm;
    
    expect(form.valid).toBeFalsy();
    
    form.patchValue({
      scientific_name: 'Test Species',
      common_name: 'Test',
      description: 'Test Description',
      ecosystem: 'forest',
      family: 'TestFamily',
      region: 'TestRegion',
      latitude: -1.0,
      longitude: -78.0,
      observation_date: '2024-08-01'
    });
    
    expect(form.valid).toBeTruthy();
  });

  it('should show validation errors', () => {
    const scientificNameControl = component.speciesForm.get('scientific_name');
    scientificNameControl?.markAsTouched();
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(
      By.css('mat-error[data-testid="scientific-name-error"]')
    );
    expect(errorElement).toBeTruthy();
  });
});
```

### Integration Tests

#### Component Integration
```typescript
// src/app/components/catalog/catalog.component.integration.spec.ts
describe('CatalogComponent Integration', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CatalogComponent, SpeciesCardComponent],
      imports: [
        HttpClientTestingModule,
        MatCardModule,
        MatChipsModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        NoopAnimationsModule
      ],
      providers: [SpeciesService]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should display species cards when data loads', fakeAsync(() => {
    const mockSpecies: Species[] = [
      {
        id: '1',
        scientific_name: 'Panthera onca',
        common_name: 'Jaguar',
        description: 'Large cat',
        ecosystem: 'forest',
        family: 'Felidae',
        region: 'Amazonia',
        latitude: -2.18,
        longitude: -77.88,
        images: ['jaguar.jpg'],
        observation_date: '2024-08-01',
        created_at: '2024-08-02T10:30:00Z'
      }
    ];

    component.ngOnInit();
    
    const req = httpMock.expectOne(/\/api\/species/);
    req.flush({ success: true, data: mockSpecies });
    
    tick();
    fixture.detectChanges();

    const speciesCards = fixture.debugElement.queryAll(
      By.css('app-species-card')
    );
    expect(speciesCards.length).toBe(1);
    
    const cardTitle = fixture.debugElement.query(
      By.css('mat-card-title')
    );
    expect(cardTitle.nativeElement.textContent.trim()).toBe('Jaguar');
  }));

  it('should filter species based on ecosystem selection', fakeAsync(() => {
    const mockSpecies: Species[] = [
      { id: '1', ecosystem: 'forest', common_name: 'Species 1' } as Species,
      { id: '2', ecosystem: 'lake', common_name: 'Species 2' } as Species
    ];

    component.ngOnInit();
    
    let req = httpMock.expectOne(/\/api\/species/);
    req.flush({ success: true, data: mockSpecies });
    tick();

    // Select forest ecosystem
    component.onFilterChange({ ecosystem: 'forest' });
    
    req = httpMock.expectOne(/\/api\/species\?ecosystem=forest/);
    req.flush({ 
      success: true, 
      data: mockSpecies.filter(s => s.ecosystem === 'forest') 
    });
    tick();
    fixture.detectChanges();

    const speciesCards = fixture.debugElement.queryAll(
      By.css('app-species-card')
    );
    expect(speciesCards.length).toBe(1);
  }));
});
```

## Backend Testing (PHP)

### PHPUnit Configuration
```xml
<!-- phpunit.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php"
         colors="true"
         processIsolation="false"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
    <coverage>
        <include>
            <directory suffix=".php">./src</directory>
        </include>
    </coverage>
</phpunit>
```

### Service Testing
```php
<?php
// tests/Unit/Services/FirebaseServiceTest.php

namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\FirebaseService;
use Mockery;

class FirebaseServiceTest extends TestCase
{
    private $firebaseService;
    private $mockFirestore;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->mockFirestore = Mockery::mock('Google\Cloud\Firestore\FirestoreClient');
        $this->firebaseService = new FirebaseService($this->mockFirestore);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testCreateSpecies()
    {
        $speciesData = [
            'scientific_name' => 'Panthera onca',
            'common_name' => 'Jaguar',
            'ecosystem' => 'forest'
        ];

        $mockCollection = Mockery::mock();
        $mockDocument = Mockery::mock();
        
        $this->mockFirestore
            ->shouldReceive('collection')
            ->with('species')
            ->andReturn($mockCollection);
            
        $mockCollection
            ->shouldReceive('add')
            ->with($speciesData)
            ->andReturn($mockDocument);
            
        $mockDocument
            ->shouldReceive('id')
            ->andReturn('species_123');

        $result = $this->firebaseService->createSpecies($speciesData);

        $this->assertEquals('species_123', $result['id']);
    }

    public function testGetSpeciesWithFilters()
    {
        $filters = [
            'ecosystem' => 'forest',
            'region' => 'Amazonia'
        ];

        $mockCollection = Mockery::mock();
        $mockQuery = Mockery::mock();
        $mockSnapshot = Mockery::mock();

        $this->mockFirestore
            ->shouldReceive('collection')
            ->with('species')
            ->andReturn($mockCollection);

        $mockCollection
            ->shouldReceive('where')
            ->with('ecosystem', '=', 'forest')
            ->andReturn($mockQuery);

        $mockQuery
            ->shouldReceive('where')
            ->with('region', '=', 'Amazonia')
            ->andReturn($mockQuery);

        $mockQuery
            ->shouldReceive('documents')
            ->andReturn($mockSnapshot);

        $mockSnapshot
            ->shouldReceive('isEmpty')
            ->andReturn(false);

        $this->firebaseService->getSpecies($filters);

        $this->assertTrue(true); // Test passed if no exceptions
    }
}
```

### Controller Testing
```php
<?php
// tests/Feature/Controllers/SpeciesControllerTest.php

namespace Tests\Feature\Controllers;

use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;

class SpeciesControllerTest extends TestCase
{
    private $client;
    private $baseUrl = 'http://localhost:8000';

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = new Client(['base_uri' => $this->baseUrl]);
    }

    public function testGetSpeciesEndpoint()
    {
        $response = $this->client->get('/api/species');
        
        $this->assertEquals(200, $response->getStatusCode());
        
        $data = json_decode($response->getBody(), true);
        $this->assertTrue($data['success']);
        $this->assertArrayHasKey('data', $data);
    }

    public function testCreateSpeciesRequiresAuthentication()
    {
        $response = $this->client->post('/api/species', [
            'http_errors' => false,
            'json' => [
                'scientific_name' => 'Test Species',
                'common_name' => 'Test'
            ]
        ]);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function testGetSpeciesWithFilters()
    {
        $response = $this->client->get('/api/species', [
            'query' => [
                'ecosystem' => 'forest',
                'region' => 'Amazonia'
            ]
        ]);

        $this->assertEquals(200, $response->getStatusCode());
        
        $data = json_decode($response->getBody(), true);
        $this->assertTrue($data['success']);
        
        // Verify all returned species match the filters
        foreach ($data['data'] as $species) {
            $this->assertEquals('forest', $species['ecosystem']);
            $this->assertEquals('Amazonia', $species['region']);
        }
    }

    public function testSpeciesValidation()
    {
        // Simulate authenticated request
        $response = $this->client->post('/api/species', [
            'http_errors' => false,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->getTestToken()
            ],
            'json' => [
                'scientific_name' => '', // Invalid: empty
                'common_name' => 'Test'
            ]
        ]);

        $this->assertEquals(422, $response->getStatusCode());
        
        $data = json_decode($response->getBody(), true);
        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('errors', $data);
    }

    private function getTestToken(): string
    {
        // Generate test JWT token or use test credentials
        return 'test_token_here';
    }
}
```

## End-to-End Testing (Cypress)

### Cypress Configuration
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshot: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
```

### E2E Test Examples
```javascript
// cypress/e2e/species-catalog.cy.js
describe('Species Catalog', () => {
  beforeEach(() => {
    cy.visit('/catalog');
  });

  it('should display species list', () => {
    cy.get('[data-cy=species-card]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=species-card]').first().should('be.visible');
  });

  it('should filter species by ecosystem', () => {
    cy.get('[data-cy=ecosystem-filter]').click();
    cy.get('[data-cy=forest-option]').click();
    
    cy.get('[data-cy=species-card]').each(($card) => {
      cy.wrap($card).should('contain', 'Bosque');
    });
  });

  it('should search species by name', () => {
    cy.get('[data-cy=search-input]').type('Jaguar');
    cy.get('[data-cy=search-button]').click();
    
    cy.get('[data-cy=species-card]').should('contain', 'Jaguar');
  });

  it('should navigate to species detail', () => {
    cy.get('[data-cy=species-card]').first().click();
    cy.url().should('include', '/species/');
    cy.get('[data-cy=species-detail]').should('be.visible');
  });
});

// cypress/e2e/species-registration.cy.js
describe('Species Registration', () => {
  beforeEach(() => {
    // Simulate authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'test_token');
    });
    cy.visit('/register');
  });

  it('should register new species', () => {
    cy.get('[data-cy=scientific-name]').type('Test Species');
    cy.get('[data-cy=common-name]').type('Test Common Name');
    cy.get('[data-cy=description]').type('Test species description');
    
    cy.get('[data-cy=ecosystem-select]').click();
    cy.get('[data-cy=forest-option]').click();
    
    cy.get('[data-cy=family-input]').type('Test Family');
    cy.get('[data-cy=region-select]').click();
    cy.get('[data-cy=amazonia-option]').click();
    
    cy.get('[data-cy=latitude]').type('-2.1833');
    cy.get('[data-cy=longitude]').type('-77.8833');
    cy.get('[data-cy=observation-date]').type('2024-08-01');
    
    // Mock file upload
    cy.get('[data-cy=image-upload]').selectFile('cypress/fixtures/test-image.jpg');
    
    cy.get('[data-cy=submit-button]').click();
    
    cy.get('[data-cy=success-message]').should('be.visible');
    cy.url().should('include', '/catalog');
  });

  it('should show validation errors', () => {
    cy.get('[data-cy=submit-button]').click();
    
    cy.get('[data-cy=scientific-name-error]').should('be.visible');
    cy.get('[data-cy=common-name-error]').should('be.visible');
  });
});
```

### Custom Cypress Commands
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('auth_token', response.body.data.token);
  });
});

Cypress.Commands.add('createTestSpecies', (speciesData) => {
  cy.request({
    method: 'POST',
    url: '/api/species',
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}`
    },
    body: speciesData
  });
});

Cypress.Commands.add('cleanupDatabase', () => {
  cy.request('DELETE', '/api/test/cleanup');
});
```

## Performance Testing

### Frontend Performance
```javascript
// cypress/e2e/performance.cy.js
describe('Performance Tests', () => {
  it('should load catalog page within 3 seconds', () => {
    const start = Date.now();
    
    cy.visit('/catalog');
    cy.get('[data-cy=species-card]').should('be.visible');
    
    cy.then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('should handle large species lists efficiently', () => {
    // Create mock data for 1000 species
    cy.intercept('GET', '/api/species', { 
      fixture: 'large-species-list.json' 
    });
    
    cy.visit('/catalog');
    cy.get('[data-cy=species-card]').should('have.length', 20); // Virtual scrolling
    
    // Test scrolling performance
    cy.get('[data-cy=species-list]').scrollTo('bottom');
    cy.get('[data-cy=species-card]').should('have.length.greaterThan', 20);
  });
});
```

### Backend Performance
```php
<?php
// tests/Performance/SpeciesPerformanceTest.php

namespace Tests\Performance;

use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;

class SpeciesPerformanceTest extends TestCase
{
    private $client;

    protected function setUp(): void
    {
        $this->client = new Client(['base_uri' => 'http://localhost:8000']);
    }

    public function testGetSpeciesResponseTime()
    {
        $start = microtime(true);
        
        $response = $this->client->get('/api/species');
        
        $duration = microtime(true) - $start;
        
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertLessThan(2.0, $duration, 'API response should be under 2 seconds');
    }

    public function testConcurrentRequests()
    {
        $promises = [];
        
        for ($i = 0; $i < 10; $i++) {
            $promises[] = $this->client->getAsync('/api/species');
        }
        
        $start = microtime(true);
        $responses = \GuzzleHttp\Promise\settle($promises)->wait();
        $duration = microtime(true) - $start;
        
        foreach ($responses as $response) {
            $this->assertEquals('fulfilled', $response['state']);
            $this->assertEquals(200, $response['value']->getStatusCode());
        }
        
        $this->assertLessThan(5.0, $duration, 'Concurrent requests should complete within 5 seconds');
    }
}
```

## Test Commands

### Frontend Testing Commands
```json
{
  "scripts": {
    "test": "ng test",
    "test:watch": "ng test --watch",
    "test:coverage": "ng test --coverage",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless",
    "e2e": "cypress open",
    "e2e:headless": "cypress run",
    "e2e:ci": "cypress run --browser chrome --headless"
  }
}
```

### Backend Testing Commands
```bash
# Run all tests
composer test

# Run with coverage
composer test:coverage

# Run specific test suite
composer test:unit
composer test:feature

# Run performance tests
composer test:performance
```

### CI/CD Pipeline Integration
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
      - name: Run unit tests
        run: npm run test:ci
        working-directory: ./frontend
      - name: Run E2E tests
        run: npm run e2e:ci
        working-directory: ./frontend

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install
        working-directory: ./backend
      - name: Run tests
        run: composer test
        working-directory: ./backend
```

## Test Data Management

### Fixtures
```json
// cypress/fixtures/species.json
{
  "success": true,
  "data": [
    {
      "id": "test_species_1",
      "scientific_name": "Panthera onca",
      "common_name": "Jaguar",
      "description": "Large cat species found in South America",
      "ecosystem": "forest",
      "family": "Felidae",
      "region": "Amazonia",
      "latitude": -2.1833,
      "longitude": -77.8833,
      "images": ["jaguar1.jpg", "jaguar2.jpg"],
      "observation_date": "2024-08-01",
      "created_at": "2024-08-02T10:30:00Z"
    }
  ]
}
```

### Test Utilities
```typescript
// src/app/testing/test-utils.ts
export class TestUtils {
  static createMockSpecies(overrides: Partial<Species> = {}): Species {
    return {
      id: 'test_species_1',
      scientific_name: 'Test Species',
      common_name: 'Test',
      description: 'Test description',
      ecosystem: 'forest',
      family: 'TestFamily',
      region: 'TestRegion',
      latitude: -1.0,
      longitude: -78.0,
      images: ['test.jpg'],
      observation_date: '2024-08-01',
      created_at: '2024-08-02T10:30:00Z',
      ...overrides
    };
  }

  static createMockApiResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      message: 'Success'
    };
  }
}
```

This comprehensive testing guide ensures quality assurance across all layers of the Terraverde application, from unit tests to end-to-end workflows.
