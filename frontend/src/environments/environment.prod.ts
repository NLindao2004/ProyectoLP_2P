export const environment = {
  production: true,
  apiUrl: 'https://your-domain.com/api',
  
  // Firebase Configuration (Production)
  firebase: {
    apiKey: "AIzaSyBrvrvaZO-uv7JR63ZyxFrhoZtAZc--j6E",
    authDomain: "terraverde-7bfbc.firebaseapp.com",
    projectId: "terraverde-7bfbc",
    storageBucket: "terraverde-7bfbc.appspot.com",
    messagingSenderId: "812943234168",
    appId: "1:812943234168:web:bb221d91a0d9604a11898d",
    measurementId: "your-measurement-id"
  },
  
  // Google Maps API
  googleMapsApiKey: 'AIzaSyDFMwz7hhgfTzREBS8F_ctBfhz4L8dFyBQ',
  
  // PWA Configuration
  pwa: {
    enabled: true,
    updateCheckInterval: 600000, // 10 minutos
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
