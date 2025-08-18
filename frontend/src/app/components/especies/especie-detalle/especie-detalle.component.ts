import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { FormsModule } from '@angular/forms'; // ✅ AGREGAR PARA COMENTARIOS
import { HeaderComponent } from '../../../pages/header/header.component';
import { EspeciesService } from '../../../services/especies.service';
import { Especie, Comentario } from '../../../models/especies.model';

@Component({
  selector: 'app-especie-detalle',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, HeaderComponent, FormsModule], // ✅ AGREGAR FormsModule
  templateUrl: './especie-detalle.component.html',
  styleUrls: ['./especie-detalle.component.scss']
})
export class EspecieDetalleComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;

  especie: Especie | null = null;
  isLoading = true;
  error = '';

  // ✅ VARIABLES PARA COMENTARIOS (del diseño original)
  nuevoComentario: Comentario = {
    texto: '',
    autor: '',
    fecha: new Date().toISOString()
  };
  enviandoComentario = false;
  errorComentario: string | null = null;

  // ✅ CONFIGURACIÓN DEL MAPA
  mapOptions: google.maps.MapOptions = {
    zoom: 14,
    mapTypeId: 'hybrid',
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  markerOptions: google.maps.MarkerOptions = {
    animation: google.maps.Animation.DROP,
    icon: {
      url: '',
      scaledSize: new google.maps.Size(28, 28),
      anchor: new google.maps.Point(14, 28)
    }
  };

  markerPosition: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  showMap = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private especiesService: EspeciesService
  ) {}

  ngOnInit(): void {
    this.cargarEspecie();
  }

  cargarEspecie(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se proporcionó un ID válido';
      this.isLoading = false;
      return;
    }

    console.log('🔍 Cargando detalle de especie:', id);

    this.especiesService.getEspecieById(id).subscribe({
      next: (especie: Especie) => {
        console.log('📡 Especie recibida del backend:', especie);

        if (especie && especie.id) {
          this.especie = especie;
          // ✅ ASEGURAR QUE COMENTARIOS EXISTE Y ESTÁ ORDENADO
          this.especie.comentarios = especie.comentarios || [];
          this.ordenarComentarios();
          this.configurarMapa();
          console.log('✅ Especie cargada:', this.especie?.nombre_vulgar);
        } else {
          this.error = 'Los datos de la especie no son válidos';
          console.error('❌ Especie inválida:', especie);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando especie:', error);
        this.error = 'Error al cargar la especie: ' + (error.message || 'Error desconocido');
        this.isLoading = false;
      }
    });
  }

  // ✅ MÉTODOS PARA COMENTARIOS (del diseño original)
  ordenarComentarios(): void {
    if (!this.especie?.comentarios) {
      this.especie!.comentarios = [];
      return;
    }

    this.especie.comentarios.sort((a, b) => {
      try {
        const fechaA = new Date(a.fecha).getTime();
        const fechaB = new Date(b.fecha).getTime();
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      } catch (error) {
        console.error('Error al ordenar comentarios:', error);
        return 0;
      }
    });
  }

  agregarComentario(): void {
    if (!this.especie?.id || !this.nuevoComentario.texto?.trim()) {
      return;
    }

    this.enviandoComentario = true;
    this.errorComentario = null;

    const comentarioData: Comentario = {
      texto: this.nuevoComentario.texto.trim(),
      autor: this.nuevoComentario.autor?.trim() || 'Anónimo',
      fecha: new Date().toISOString()
    };

    this.especiesService.agregarComentario(this.especie.id, comentarioData).subscribe({
      next: (especieActualizada) => {
        this.especie = especieActualizada;
        this.ordenarComentarios();
        this.nuevoComentario = { texto: '', autor: '', fecha: '' };
        this.enviandoComentario = false;
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.errorComentario = error.message || 'Error al agregar el comentario. Por favor, inténtalo de nuevo.';
        this.enviandoComentario = false;
      }
    });
  }

  configurarMapa(): void {
    if (!this.especie?.coordenadas) {
      console.log('⚠️ No hay coordenadas disponibles para mostrar el mapa');
      return;
    }

    const lat = this.especie.coordenadas.latitud;
    const lng = this.especie.coordenadas.longitud;

    console.log(`🗺️ Configurando mapa para: ${lat}, ${lng}`);

    this.markerPosition = { lat, lng };
    this.mapOptions.center = { lat, lng };

    this.markerOptions.icon = {
      url: this.getMarkerIcon(this.especie.estado_conservacion),
      scaledSize: new google.maps.Size(28, 28),
      anchor: new google.maps.Point(14, 28)
    };

    this.showMap = true;
    console.log('✅ Mapa configurado correctamente');
  }

  getMarkerIcon(status: string): string {
    const createSVGIcon = (color: string, borderColor: string = '#ffffff'): string => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12" fill="${color}" stroke="${borderColor}" stroke-width="2"/>
          <circle cx="14" cy="14" r="6" fill="${color}" opacity="0.8"/>
          <circle cx="14" cy="14" r="3" fill="${borderColor}" opacity="0.9"/>
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

    return createSVGIcon(colors[status] || '#6c757d');
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

  determinarProvincia(lat: number, lng: number): string {
    if (lat === 0 && lng === 0) return 'Sin ubicación';

    if (lng >= -92 && lng <= -89) {
      return 'Galápagos';
    }
    else if (lng >= -81 && lat >= -3) {
      return 'Costa';
    }
    else if (lng >= -79 && lng <= -75) {
      return 'Oriente';
    }
    else {
      return 'Sierra';
    }
  }

  onMarkerClick(): void {
    if (this.especie?.coordenadas) {
      const lat = this.especie.coordenadas.latitud;
      const lng = this.especie.coordenadas.longitud;
      this.map?.panTo({ lat, lng });
      console.log(`📍 Marcador clickeado: ${this.especie.nombre_vulgar} en ${lat}, ${lng}`);
    }
  }

  volverAlCatalogo(): void {
    this.router.navigate(['/catalogo']);
  }

  editarEspecie(): void {
    if (this.especie?.id) {
      this.router.navigate(['/editar-especie', this.especie.id]);
    }
  }
}