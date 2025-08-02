# Guía de Instalación y Configuración - Terraverde

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+ y npm
- PHP 8.0+ y Composer
- Angular CLI (`npm install -g @angular/cli`)

### 1. Clonar el repositorio
```bash
git clone https://github.com/NLindao2004/ProyectoLP_2P.git
cd ProyectoLP_2P
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del proyecto completo
npm install

# O instalación manual:
cd frontend && npm install
cd ../backend && composer install
```

### 3. Configurar Firebase

#### Crear proyecto en Firebase Console
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto "terraverde-proyecto"
3. Habilitar Firestore Database
4. Habilitar Firebase Storage
5. Configurar reglas de seguridad

#### Obtener credenciales de configuración
1. Ir a Configuración del proyecto > Configuración general
2. En "Tus apps" agregar app web
3. Copiar configuración de Firebase

#### Configurar variables de entorno

**Frontend (`frontend/src/environments/environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  firebase: {
    apiKey: "tu-api-key",
    authDomain: "terraverde-proyecto.firebaseapp.com",
    projectId: "terraverde-proyecto",
    storageBucket: "terraverde-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456",
    measurementId: "G-XXXXXXXXXX"
  },
  googleMapsApiKey: 'tu-google-maps-api-key'
};
```

**Backend (`backend/.env`):**
```env
FIREBASE_PROJECT_ID=terraverde-proyecto
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@terraverde-proyecto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=tu-client-id
FIREBASE_STORAGE_BUCKET=terraverde-proyecto.appspot.com
GOOGLE_MAPS_API_KEY=tu-google-maps-api-key
```

### 4. Configurar Google Maps API
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto o seleccionar existente
3. Habilitar Maps JavaScript API
4. Crear credencial (API Key)
5. Configurar restricciones de API key

### 5. Ejecutar el proyecto

#### Desarrollo (ambos servidores simultáneamente)
```bash
npm run dev
```

#### O ejecutar por separado:
```bash
# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Frontend
cd frontend
ng serve
```

### 6. Acceder a la aplicación
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/api/health

## 🛠️ Configuración Adicional

### PWA Configuration
El proyecto ya incluye configuración PWA. Para probarlo:
1. Construir para producción: `ng build --prod`
2. Servir con HTTPS: `npx http-server dist -p 8080 --ssl`
3. Abrir https://localhost:8080

### Configuración de CORS
El backend ya incluye configuración CORS para desarrollo. Para producción:
1. Actualizar `SANCTUM_STATEFUL_DOMAINS` en `.env`
2. Configurar dominio de producción en `config/cors.php`

### Base de Datos Firebase
Estructura de colecciones sugerida:
```
/species
  /{speciesId}
    - scientificName: string
    - commonName: string
    - description: string
    - ecosystem: 'forest' | 'lake' | 'beach'
    - family: string
    - region: string
    - latitude: number
    - longitude: number
    - images: string[]
    - observationDate: timestamp
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Reglas de Seguridad Firebase
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de especies
    match /species/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Despliegue en Producción

### Frontend (Vercel/Netlify)
```bash
cd frontend
ng build --prod
# Subir carpeta dist/ a Vercel o Netlify
```

### Backend (Heroku/Railway/DigitalOcean)
```bash
cd backend
# Configurar variables de entorno en el servicio
# Desplegar siguiendo documentación del proveedor
```

## 📱 Instalación como PWA
1. Abrir la aplicación en Chrome/Edge
2. Click en el icono de instalación en la barra de direcciones
3. Seguir las instrucciones de instalación

## 🔧 Desarrollo

### Comandos útiles
```bash
# Frontend
ng generate component pages/nueva-pagina
ng build --watch
ng test

# Backend
php artisan make:controller NuevoController
php artisan serve --host=0.0.0.0
composer dump-autoload

# Proyecto completo
npm run build-all
npm run test-all
```

### Estructura del Proyecto
```
ProyectoLP_2P/
├── frontend/           # Angular 17+ PWA
│   ├── src/app/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/      # Páginas de la aplicación
│   │   ├── services/   # Servicios Angular
│   │   └── models/     # Modelos TypeScript
├── backend/            # Laravel PHP API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Services/   # Servicios Firebase
│   │   └── Models/     # Modelos (si se usa)
└── docs/              # Documentación
```

## 🆘 Solución de Problemas

### Error: "Firebase not initialized"
- Verificar credenciales en environment.ts
- Verificar que Firebase esté configurado en app.config.ts

### Error: "CORS policy"
- Verificar configuración CORS en backend
- Verificar SANCTUM_STATEFUL_DOMAINS en .env

### Error: "Google Maps not loading"
- Verificar API key de Google Maps
- Verificar que Maps JavaScript API esté habilitada

### Performance Issues
- Verificar que las imágenes se optimicen antes de subir
- Usar lazy loading en componentes
- Implementar paginación en listas grandes

## 📞 Soporte

Para soporte técnico o reportar bugs:
- Crear issue en GitHub: https://github.com/NLindao2004/ProyectoLP_2P/issues
- Contactar a los desarrolladores:
  - Benites Alex
  - Lindao Nehemias
  - Zavala Fernando
