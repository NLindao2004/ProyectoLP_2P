export interface Species {
  id?: string;
  scientificName: string;
  commonName: string;
  description: string;
  ecosystem: 'forest' | 'lake' | 'beach';
  family: string;
  region: string;
  latitude: number;
  longitude: number;
  images: string[];
  observationDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpeciesFilter {
  ecosystem?: 'forest' | 'lake' | 'beach';
  scientificName?: string;
  commonName?: string;
  family?: string;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SpeciesStatistics {
  totalSpecies: number;
  byEcosystem: {
    forest: number;
    lake: number;
    beach: number;
  };
  byFamily: Record<string, number>;
  byRegion: Record<string, number>;
  recentAdditions: Species[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: any;
}

export interface ReportData {
  speciesCount: number;
  species: Species[];
  statistics: {
    total: number;
    byEcosystem: Record<string, number>;
    byFamily: Record<string, number>;
    byRegion: Record<string, number>;
    byMonth: Record<string, number>;
  };
  filtersApplied: SpeciesFilter;
}

export interface Ecosystem {
  value: 'forest' | 'lake' | 'beach';
  label: string;
  icon: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ImageUpload {
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
}
