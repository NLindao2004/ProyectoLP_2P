import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, GoogleMap, MapMarker } from '@angular/google-maps';
import { EspeciesService } from '../../services/especies.service';
import { Especie } from '../../models/especies.model';
import { HeaderComponent } from '../header/header.component';
interface ProvinciaInfo {
  name: string;
  center: google.maps.LatLngLiteral;
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule, HeaderComponent],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;

  // Configuración del mapa
  mapOptions: google.maps.MapOptions = {
    center: { lat: -1.831239, lng: -78.183406 },
    zoom: 7,
    mapTypeId: 'roadmap',
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#e9f3ff" }]
      }
    ]
  };

  // Datos
  especies: Especie[] = [];
  especiesFiltradas: Especie[] = [];

  // ✅ PROVINCIAS DE ECUADOR con coordenadas precisas
  provincias: ProvinciaInfo[] = [
    {
      name: 'Pichincha',
      center: { lat: -0.1807, lng: -78.4678 },
      zoom: 10,
      bounds: { north: 0.37, south: -1.05, east: -77.85, west: -79.23 }
    },
    {
      name: 'Guayas',
      center: { lat: -2.1962, lng: -79.8862 },
      zoom: 9,
      bounds: { north: -1.27, south: -3.04, east: -79.16, west: -80.96 }
    },
    {
      name: 'Azuay',
      center: { lat: -2.8969, lng: -79.0067 },
      zoom: 10,
      bounds: { north: -2.16, south: -3.76, east: -78.16, west: -79.95 }
    },
    {
      name: 'Manabí',
      center: { lat: -1.0545, lng: -80.4545 },
      zoom: 9,
      bounds: { north: 0.8, south: -2.3, east: -79.41, west: -81.06 }
    },
    {
      name: 'El Oro',
      center: { lat: -3.2581, lng: -79.9553 },
      zoom: 10,
      bounds: { north: -2.96, south: -4.06, east: -79.09, west: -80.82 }
    },
    {
      name: 'Los Ríos',
      center: { lat: -1.8, lng: -79.5 },
      zoom: 10,
      bounds: { north: -0.63, south: -2.3, east: -78.65, west: -79.8 }
    },
    {
      name: 'Esmeraldas',
      center: { lat: 0.9592, lng: -79.6567 },
      zoom: 9,
      bounds: { north: 1.47, south: 0.01, east: -78.15, west: -80.97 }
    },
    {
      name: 'Tungurahua',
      center: { lat: -1.2416, lng: -78.6267 },
      zoom: 11,
      bounds: { north: -0.93, south: -1.55, east: -78.05, west: -79.2 }
    },
    {
      name: 'Imbabura',
      center: { lat: 0.3492, lng: -78.1217 },
      zoom: 10,
      bounds: { north: 0.84, south: -0.39, east: -77.64, west: -78.89 }
    },
    {
      name: 'Chimborazo',
      center: { lat: -1.6635, lng: -78.6547 },
      zoom: 10,
      bounds: { north: -1.01, south: -2.38, east: -78.06, west: -79.3 }
    },
    {
      name: 'Cotopaxi',
      center: { lat: -0.9324, lng: -78.6158 },
      zoom: 10,
      bounds: { north: -0.42, south: -1.45, east: -78.05, west: -79.22 }
    },
    {
      name: 'Loja',
      center: { lat: -3.9928, lng: -79.2042 },
      zoom: 10,
      bounds: { north: -3.27, south: -5.01, east: -78.15, west: -80.96 }
    },
    {
      name: 'Santo Domingo',
      center: { lat: -0.2500, lng: -79.1750 },
      zoom: 11,
      bounds: { north: 0.13, south: -0.63, east: -78.75, west: -79.6 }
    },
    {
      name: 'Santa Elena',
      center: { lat: -2.2269, lng: -80.8590 },
      zoom: 10,
      bounds: { north: -1.93, south: -2.97, east: -80.19, west: -81.1 }
    },
    {
      name: 'Carchi',
      center: { lat: 0.8118, lng: -77.7178 },
      zoom: 10,
      bounds: { north: 1.47, south: 0.3, east: -77.64, west: -78.89 }
    },
    {
      name: 'Bolívar',
      center: { lat: -1.5883, lng: -79.0058 },
      zoom: 10,
      bounds: { north: -1.01, south: -2.31, east: -78.65, west: -79.66 }
    },
    {
      name: 'Cañar',
      center: { lat: -2.5597, lng: -78.9406 },
      zoom: 10,
      bounds: { north: -2.16, south: -2.96, east: -78.16, west: -79.67 }
    },
    // ORIENTE
    {
      name: 'Pastaza',
      center: { lat: -1.4869, lng: -77.9958 },
      zoom: 9,
      bounds: { north: -1.01, south: -2.97, east: -76.0, west: -78.17 }
    },
    {
      name: 'Morona Santiago',
      center: { lat: -2.3084, lng: -78.1175 },
      zoom: 9,
      bounds: { north: -1.55, south: -4.36, east: -76.0, west: -78.97 }
    },
    {
      name: 'Zamora Chinchipe',
      center: { lat: -4.0669, lng: -78.9547 },
      zoom: 9,
      bounds: { north: -3.27, south: -5.01, east: -76.0, west: -79.95 }
    },
    {
      name: 'Sucumbíos',
      center: { lat: 0.0836, lng: -76.8983 },
      zoom: 9,
      bounds: { north: 1.47, south: -1.01, east: -75.19, west: -77.64 }
    },
    {
      name: 'Orellana',
      center: { lat: -0.4616, lng: -76.9875 },
      zoom: 9,
      bounds: { north: 0.37, south: -1.55, east: -75.19, west: -77.64 }
    },
    {
      name: 'Napo',
      center: { lat: -1.0049, lng: -77.8076 },
      zoom: 9,
      bounds: { north: -0.42, south: -1.55, east: -76.0, west: -78.97 }
    },
    // GALÁPAGOS
    {
      name: 'Galápagos',
      center: { lat: -0.7893, lng: -90.9542 },
      zoom: 9,
      bounds: { north: 1.47, south: -1.4, east: -89.14, west: -92.01 }
    }
  ];

  // Filtros
  provinciaSeleccionada: string = 'Todas';
  especieSeleccionada: Especie | null = null;

  // Estado del mapa
  isLoading = true;
  error: string = '';
  markers: any[] = [];

  constructor(private especiesService: EspeciesService) {}

  ngOnInit(): void {
    this.cargarEspecies();
    this.debugEstados();
  }

  async cargarEspecies(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = '';

      console.log('🔄 Cargando especies desde Firebase...');

      const response = await this.especiesService.getEspecies().toPromise();

      console.log('📡 Respuesta del backend:', response);

      if (response && response.success && response.data && response.data.especies) {
        this.especies = response.data.especies;
        this.aplicarFiltros();
        console.log('✅ Especies cargadas desde Firebase:', this.especies.length);
        console.log('🗺️ Especies con coordenadas:', this.especies.filter(e => e.coordenadas?.latitud && e.coordenadas?.longitud).length);
      } else {
        throw new Error('No se recibieron datos válidos del servidor');
      }

    } catch (error: any) {
      console.error('❌ Error cargando especies:', error);
      this.error = 'Error al cargar especies: ' + (error.message || 'Error desconocido');

      console.log('⚠️ Cargando datos de ejemplo...');
      this.cargarDatosEjemplo();

    } finally {
      this.isLoading = false;
    }
  }

  cargarDatosEjemplo(): void {
    console.log('📝 Cargando datos de ejemplo...');
    this.especies = [
      {
        id: 'ejemplo-1',
        nombre_cientifico: 'Pharomachrus mocinno',
        nombre_vulgar: 'Quetzal (Pichincha)',
        familia: 'Trogonidae',
        estado_conservacion: 'En peligro',
        habitat: 'Bosque Nublado',
        descripcion: 'Ave emblemática de los bosques nublados',
        coordenadas: { latitud: -0.1807, longitud: -78.4678 }, // Quito
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      },
      {
        id: 'ejemplo-2',
        nombre_cientifico: 'Amblyrhynchus cristatus',
        nombre_vulgar: 'Iguana Marina (Galápagos)',
        familia: 'Iguanidae',
        estado_conservacion: 'Vulnerable',
        habitat: 'Costero',
        descripcion: 'Única iguana marina del mundo',
        coordenadas: { latitud: -0.7893, longitud: -90.9542 }, // Galápagos
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      },
      {
        id: 'ejemplo-3',
        nombre_cientifico: 'Phoenicopterus ruber',
        nombre_vulgar: 'Flamenco (Guayas)',
        familia: 'Phoenicopteridae',
        estado_conservacion: 'Preocupación menor',
        habitat: 'Humedales',
        descripcion: 'Ave acuática de humedales costeros',
        coordenadas: { latitud: -2.1962, longitud: -79.8862 }, // Guayaquil
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      },
      {
        id: 'ejemplo-4',
        nombre_cientifico: 'Panthera onca',
        nombre_vulgar: 'Jaguar (Pastaza)',
        familia: 'Felidae',
        estado_conservacion: 'Casi amenazado',
        habitat: 'Selva Tropical',
        descripcion: 'Felino más grande de América',
        coordenadas: { latitud: -1.4869, longitud: -77.9958 }, // Pastaza
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      }
    ];
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    if (this.provinciaSeleccionada === 'Todas') {
      this.especiesFiltradas = [...this.especies];
    } else {
      this.especiesFiltradas = this.especies.filter(especie => {
        const provincia = this.determinarProvinciaPorCoordenadas(especie.coordenadas.latitud, especie.coordenadas.longitud);
        return provincia === this.provinciaSeleccionada;
      });
    }
    console.log(`🔍 Aplicando filtro provincia: ${this.provinciaSeleccionada} - ${this.especiesFiltradas.length} especies`);
    this.actualizarMarkers();
  }

  // ✅ NUEVA FUNCIÓN: Determinar provincia por coordenadas
  determinarProvinciaPorCoordenadas(lat: number, lng: number): string {
    if (lat === 0 && lng === 0) return 'Sin ubicación';

    // Buscar en qué provincia están las coordenadas
    for (const provincia of this.provincias) {
      const bounds = provincia.bounds;
      if (lat <= bounds.north && lat >= bounds.south &&
          lng <= bounds.east && lng >= bounds.west) {
        return provincia.name;
      }
    }

    return 'Fuera de Ecuador';
  }

  // ✅ FUNCIÓN ACTUALIZADA: Cambio de provincia
  async onProvinciaChange(provincia: string): Promise<void> {
    this.provinciaSeleccionada = provincia;

    if (provincia !== 'Todas') {
      try {
        this.isLoading = true;
        console.log(`🔄 Filtrando especies de provincia: ${provincia}`);

        // Aplicar filtro local por coordenadas
        this.aplicarFiltros();

        // Centrar mapa en la provincia seleccionada
        const provinciaInfo = this.provincias.find(p => p.name === provincia);
        if (provinciaInfo && this.map) {
          this.map.panTo(provinciaInfo.center);
          this.map.zoom = provinciaInfo.zoom;
          console.log(`🗺️ Centrando mapa en ${provincia}:`, provinciaInfo.center);
        }

      } catch (error) {
        console.error('❌ Error filtrando por provincia:', error);
        this.aplicarFiltros();
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('🗺️ Mostrando todas las provincias');
      this.aplicarFiltros();
      this.map?.panTo({ lat: -1.831239, lng: -78.183406 }); // Centro de Ecuador
      if (this.map) {
        this.map.zoom = 7;
      }
    }
  }

  actualizarMarkers(): void {
    const especiesConCoordenadas = this.especiesFiltradas
      .filter(especie => especie.coordenadas?.latitud && especie.coordenadas?.longitud);

    this.markers = especiesConCoordenadas.map((especie, index) => {
      let lat = especie.coordenadas!.latitud;
      let lng = especie.coordenadas!.longitud;

      // Separar especies en ubicaciones muy cercanas
      const especiesCercanas = especiesConCoordenadas.filter(e =>
        Math.abs(e.coordenadas.latitud - lat) < 0.001 &&
        Math.abs(e.coordenadas.longitud - lng) < 0.001
      );

      if (especiesCercanas.length > 1) {
        const offset = index * 0.002;
        lat += offset;
        lng += offset;
        console.log(`📍 Separando marcador ${especie.nombre_vulgar} - Offset: ${offset}`);
      }

      const provincia = this.determinarProvinciaPorCoordenadas(especie.coordenadas.latitud, especie.coordenadas.longitud);
      console.log(`📍 Creando marcador para: ${especie.nombre_vulgar} - Provincia: ${provincia} - Estado: ${especie.estado_conservacion}`);

      return {
        position: { lat, lng },
        title: `${especie.nombre_vulgar} (${provincia})`,
        info: especie,
        options: {
          icon: {
            url: this.getMarkerIcon(especie.estado_conservacion),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          }
        }
      };
    });

    console.log(`📍 Marcadores creados: ${this.markers.length}`);
  }

  // ✅ FUNCIÓN SVG (sin cambios)
  getMarkerIcon(status: string): string {
    const createSVGIcon = (color: string, borderColor: string = '#ffffff'): string => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="${borderColor}" stroke-width="2"/>
          <circle cx="12" cy="12" r="6" fill="${color}" opacity="0.8"/>
        </svg>
      `;
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    };

    const colors: {[key: string]: string} = {
      'En peligro': '#fd7e14',
      'Preocupación menor': '#28a745',
      'Peligro crítico': '#dc3545',
      'Vulnerable': '#007bff',
      'No evaluado': '#6c757d',
      'Extinto': '#e91e63',
      'Casi amenazado': '#ffc107',
      'Datos insuficientes': '#6f42c1',
      'Extinto en estado silvestre': '#17a2b8'
    };

    const color = colors[status] || '#6c757d';
    console.log(`🎨 Estado: "${status}" -> Color SVG: ${color}`);

    return createSVGIcon(color);
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return '#6c757d';

    const colors: {[key: string]: string} = {
      'En peligro': '#fd7e14',
      'Preocupación menor': '#28a745',
      'Peligro crítico': '#dc3545',
      'Vulnerable': '#007bff',
      'No evaluado': '#6c757d',
      'Extinto': '#e91e63',
      'Casi amenazado': '#ffc107',
      'Datos insuficientes': '#6f42c1',
      'Extinto en estado silvestre': '#17a2b8'
    };

    return colors[status] || '#6c757d';
  }

  onMarkerClick(marker: any): void {
    this.especieSeleccionada = marker.info;
    const provincia = this.determinarProvinciaPorCoordenadas(
      this.especieSeleccionada!.coordenadas.latitud,
      this.especieSeleccionada!.coordenadas.longitud
    );
    console.log('📌 Especie seleccionada:', this.especieSeleccionada?.nombre_vulgar, 'en', provincia);
  }

  cerrarInfoEspecie(): void {
    this.especieSeleccionada = null;
  }

  private debugEstados(): void {
    setTimeout(() => {
      const estadosUnicos = [...new Set(this.especies.map(e => e.estado_conservacion))];
      console.log('🎯 Estados únicos encontrados:', estadosUnicos);

      const conteo = this.especies.reduce((acc, especie) => {
        acc[especie.estado_conservacion] = (acc[especie.estado_conservacion] || 0) + 1;
        return acc;
      }, {} as {[key: string]: number});

      console.log('📊 Conteo por estado:', conteo);

      // ✅ NUEVO DEBUG: Mostrar especies por provincia
      const conteoPorProvincia = this.especies.reduce((acc, especie) => {
        const provincia = this.determinarProvinciaPorCoordenadas(especie.coordenadas.latitud, especie.coordenadas.longitud);
        acc[provincia] = (acc[provincia] || 0) + 1;
        return acc;
      }, {} as {[key: string]: number});

      console.log('🏛️ Especies por provincia:', conteoPorProvincia);
    }, 2000);
  }
}
