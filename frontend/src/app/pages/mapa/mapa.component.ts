import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, GoogleMap, MapMarker } from '@angular/google-maps';
import { EspeciesService } from '../../services/especies.service';
import { Especie } from '../../models/especies.model';

interface RegionInfo {
  name: string;
  center: google.maps.LatLngLiteral;
  zoom: number;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;

  // Configuración del mapa
  mapOptions: google.maps.MapOptions = {
    center: { lat: -1.831239, lng: -78.183406 },
    zoom: 7,
    mapTypeId: 'roadmap', // Mejor contraste para los iconos
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
  regiones: RegionInfo[] = [
    { name: 'Costa', center: { lat: -1.045, lng: -80.456 }, zoom: 8 },
    { name: 'Sierra', center: { lat: -1.831239, lng: -78.183406 }, zoom: 8 },
    { name: 'Amazonia', center: { lat: -1.5, lng: -77.5 }, zoom: 7 },
    { name: 'Galapagos', center: { lat: -0.7893, lng: -90.9542 }, zoom: 9 }
  ];

  // Filtros
  regionSeleccionada: string = 'Todas';
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
        nombre_vulgar: 'Quetzal (Ejemplo)',
        familia: 'Trogonidae',
        estado_conservacion: 'En peligro',
        habitat: 'Bosque Nublado',
        descripcion: 'Ave emblemática de los bosques nublados',
        coordenadas: { latitud: -0.1807, longitud: -78.4678 },
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      },
      {
        id: 'ejemplo-2',
        nombre_cientifico: 'Amblyrhynchus cristatus',
        nombre_vulgar: 'Iguana Marina (Ejemplo)',
        familia: 'Iguanidae',
        estado_conservacion: 'Vulnerable',
        habitat: 'Costero',
        descripcion: 'Única iguana marina del mundo',
        coordenadas: { latitud: -0.7893, longitud: -90.9542 },
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      },
      {
        id: 'ejemplo-3',
        nombre_cientifico: 'Panthera onca',
        nombre_vulgar: 'Jaguar (Ejemplo)',
        familia: 'Felidae',
        estado_conservacion: 'Casi amenazado',
        habitat: 'Selva Tropical',
        descripcion: 'Felino más grande de América',
        coordenadas: { latitud: -1.3, longitud: -77.8 },
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      },
      {
        id: 'ejemplo-4',
        nombre_cientifico: 'Phoenicopterus ruber',
        nombre_vulgar: 'Flamenco (Ejemplo)',
        familia: 'Phoenicopteridae',
        estado_conservacion: 'No evaluado',
        habitat: 'Humedales',
        descripcion: 'Ave acuática de humedales costeros',
        coordenadas: { latitud: -2.1962, longitud: -80.8890 },
        fecha_registro: new Date().toISOString(),
        registrado_por: 'sistema',
        activo: true
      }
    ];
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    if (this.regionSeleccionada === 'Todas') {
      this.especiesFiltradas = [...this.especies];
    } else {
      this.especiesFiltradas = this.especies.filter(especie => {
        const region = this.determinarRegionPorCoordenadas(especie.coordenadas.latitud, especie.coordenadas.longitud);
        return region === this.regionSeleccionada;
      });
    }
    console.log(`🔍 Aplicando filtro: ${this.regionSeleccionada} - ${this.especiesFiltradas.length} especies`);
    this.actualizarMarkers();
  }

  determinarRegionPorCoordenadas(lat: number, lng: number): string {
    if (lat === 0 && lng === 0) return 'Sin ubicación';

    if (lng >= -92 && lng <= -89) {
      return 'Galapagos';
    } else if (lng >= -81 && lat >= -3) {
      return 'Costa';
    } else if (lng >= -79 && lng <= -77) {
      return 'Amazonia';
    } else {
      return 'Sierra';
    }
  }

  async onRegionChange(region: string): Promise<void> {
    this.regionSeleccionada = region;

    if (region !== 'Todas') {
      try {
        this.isLoading = true;
        console.log(`🔄 Cargando especies de región: ${region}`);

        const response = await this.especiesService.getEspeciesPorRegion(region).toPromise();

        if (response && response.success && response.data && response.data.especies) {
          this.especiesFiltradas = response.data.especies;
          console.log(`✅ Especies de ${region} cargadas:`, this.especiesFiltradas.length);
          this.actualizarMarkers();
        } else {
          console.log('⚠️ No se encontraron especies para la región, usando filtro local');
          this.aplicarFiltros();
        }

        const regionInfo = this.regiones.find(r => r.name === region);
        if (regionInfo && this.map) {
          this.map.panTo(regionInfo.center);
          this.map.zoom = regionInfo.zoom;
        }

      } catch (error) {
        console.error('❌ Error cargando especies por región:', error);
        this.aplicarFiltros();
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('🗺️ Mostrando todas las regiones');
      this.aplicarFiltros();
      this.map?.panTo({ lat: -1.831239, lng: -78.183406 });
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

      console.log(`📍 Creando marcador para: ${especie.nombre_vulgar} - Estado: ${especie.estado_conservacion}`);

      return {
        position: { lat, lng },
        title: `${especie.nombre_vulgar} (${especie.estado_conservacion})`,
        info: especie,
        options: {
          icon: {
            url: this.getMarkerIcon(especie.estado_conservacion),
            scaledSize: new google.maps.Size(24, 24), // Tamaño consistente
            anchor: new google.maps.Point(12, 12) // Centrar el icono
          }
        }
      };
    });

    console.log(`📍 Marcadores creados: ${this.markers.length}`);
  }

  // ✅ FUNCIÓN PRINCIPAL: Crear iconos SVG personalizados
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

    // ✅ TUS COLORES EXACTOS
    const colors: {[key: string]: string} = {
      'En peligro': '#fd7e14',           // Naranja
      'Preocupación menor': '#28a745',   // Verde
      'Peligro crítico': '#dc3545',      // Rojo
      'Vulnerable': '#007bff',           // Azul
      'No evaluado': '#6c757d',          // Gris
      'Extinto': '#e91e63',              // Rosado
      'Casi amenazado': '#ffc107',       // Amarillo
      'Datos insuficientes': '#6f42c1',  // Morado/Negro
      'Extinto en estado silvestre': '#17a2b8' // Celeste
    };

    const color = colors[status] || '#6c757d';
    console.log(`🎨 Estado: "${status}" -> Color SVG: ${color}`);

    return createSVGIcon(color);
  }

  // ✅ COLORES PARA BADGES (consistente con iconos)
  getStatusColor(status: string | undefined): string {
    if (!status) return '#6c757d';

    const colors: {[key: string]: string} = {
      'En peligro': '#fd7e14',           // Naranja
      'Preocupación menor': '#28a745',   // Verde
      'Peligro crítico': '#dc3545',      // Rojo
      'Vulnerable': '#007bff',           // Azul
      'No evaluado': '#6c757d',          // Gris
      'Extinto': '#e91e63',              // Rosado
      'Casi amenazado': '#ffc107',       // Amarillo
      'Datos insuficientes': '#6f42c1',  // Morado
      'Extinto en estado silvestre': '#17a2b8' // Celeste
    };

    return colors[status] || '#6c757d';
  }

  onMarkerClick(marker: any): void {
    this.especieSeleccionada = marker.info;
    console.log('📌 Especie seleccionada:', this.especieSeleccionada?.nombre_vulgar);
  }

  cerrarInfoEspecie(): void {
    this.especieSeleccionada = null;
  }

  // ✅ DEBUG: Ver qué estados tienes en tus datos
  private debugEstados(): void {
    setTimeout(() => {
      const estadosUnicos = [...new Set(this.especies.map(e => e.estado_conservacion))];
      console.log('🎯 Estados únicos encontrados en tus datos:', estadosUnicos);

      const conteo = this.especies.reduce((acc, especie) => {
        acc[especie.estado_conservacion] = (acc[especie.estado_conservacion] || 0) + 1;
        return acc;
      }, {} as {[key: string]: number});

      console.log('📊 Conteo por estado:', conteo);
    }, 2000);
  }
}
