export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  
  // Firebase Configuration
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
  },
  
  // Google Maps API
  googleMapsApiKey: 'your-google-maps-api-key',
  
  // PWA Configuration
  pwa: {
    enabled: true,
    updateCheckInterval: 300000, // 5 minutos
  },
  
  // App Configuration
  app: {
    name: 'Terraverde',
    version: '1.0.0',
    description: 'Plataforma de catalogación de especies',
    defaultLanguage: 'es',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxImagesPerSpecies: 10,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
    ecosystems: [
      { value: 'forest', label: 'Bosque', icon: '🌲' },
      { value: 'lake', label: 'Lago', icon: '🏞️' },
      { value: 'beach', label: 'Playa', icon: '🏖️' }
    ],
    regions: [
      'Costa',
      'Sierra', 
      'Amazonia',
      'Galápagos'
    ]
  }
};
