export interface Comentario {
  id?: string;
  texto: string;
  autor: string;
  fecha: string;
}

// ✅ AGREGAR: Nueva interfaz para imágenes
export interface ImagenEspecie {
  id?: string;
  url: string;
  nombre?: string;
  descripcion?: string;
  size?: number;
  mime_type?: string;
}

export interface Especie {
  id?: string;
  nombre_cientifico: string;
  nombre_vulgar: string;
  familia: string;
  estado_conservacion: string;
  habitat: string;
  descripcion?: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  fecha_registro?: string;
  fecha_actualizacion?: string;
  registrado_por: string;
  activo?: boolean;
  comentarios?: Comentario[];
  imagenes?: ImagenEspecie[]; // ✅ AGREGAR: Propiedad para imágenes
}

export interface EspecieFormData {
  nombre_cientifico: string;
  nombre_vulgar: string;
  familia: string;
  estado_conservacion: string;
  habitat: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  registrado_por: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface EspeciesListResponse {
  success: boolean;
  message: string;
  data: Especie[];
  timestamp: string;
}

// Enum para estados de conservación
export enum EstadoConservacion {
  EXTINTO = 'Extinto',
  EXTINTO_SILVESTRE = 'Extinto en estado silvestre',
  PELIGRO_CRITICO = 'En peligro crítico',
  PELIGRO = 'En peligro',
  VULNERABLE = 'Vulnerable',
  CASI_AMENAZADO = 'Casi amenazado',
  PREOCUPACION_MENOR = 'Preocupación menor',
  NO_EVALUADO = 'No evaluado',
  DATOS_INSUFICIENTES = 'Datos insuficientes'
}

// Familias más comunes en Ecuador
export const FAMILIAS_COMUNES = [
  'Orchidaceae',
  'Asteraceae',
  'Fabaceae',
  'Rubiaceae',
  'Melastomataceae',
  'Araceae',
  'Bromeliaceae',
  'Solanaceae',
  'Piperaceae',
  'Gesneriaceae',
  'Ericaceae',
  'Lauraceae',
  'Moraceae',
  'Euphorbiaceae',
  'Acanthaceae'
];