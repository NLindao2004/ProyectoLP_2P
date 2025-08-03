# Instalación del Backend - Terraverde

## Prerrequisitos Requeridos

### 1. Instalar PHP 8.0+
- Descargar desde: https://www.php.net/downloads
- Verificar instalación: `php --version`

### 2. Instalar Composer
- Descargar desde: https://getcomposer.org/download/
- Ejecutar el instalador para Windows
- Verificar instalación: `composer --version`

## Instrucciones de Instalación

### Paso 1: Crear proyecto Laravel
```bash
composer create-project laravel/laravel . --prefer-dist
```

### Paso 2: Instalar dependencias adicionales
```bash
composer require kreait/firebase-php
composer require tymon/jwt-auth
composer require spatie/laravel-cors
composer require barryvdh/laravel-dompdf
```

### Paso 3: Configurar variables de entorno
Copiar `.env.example` a `.env` y configurar:

```env
APP_NAME=Terraverde
APP_ENV=local
APP_KEY=base64:YOUR_APP_KEY
APP_DEBUG=true
APP_URL=http://localhost:8000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:4200
```

### Paso 4: Generar clave de aplicación
```bash
php artisan key:generate
```

### Paso 5: Ejecutar servidor de desarrollo
```bash
php artisan serve
```

## Estructura de Archivos Creada

### Controladores API
- `app/Http/Controllers/Api/SpeciesController.php` - Manejo de especies
- `app/Http/Controllers/Api/ReportController.php` - Generación de reportes
- `app/Http/Controllers/Api/AuthController.php` - Autenticación

### Servicios Firebase
- `app/Services/FirebaseService.php` - Conexión con Firestore
- `app/Services/StorageService.php` - Manejo de Firebase Storage

### Rutas API
- `routes/api.php` - Definición de endpoints REST

### Configuración
- `config/firebase.php` - Configuración de Firebase
- `config/cors.php` - Configuración CORS

## Endpoints API Disponibles

### Especies
- `GET /api/species` - Listar especies
- `POST /api/species` - Crear especie
- `GET /api/species/{id}` - Obtener especie
- `PUT /api/species/{id}` - Actualizar especie
- `DELETE /api/species/{id}` - Eliminar especie

### Reportes
- `POST /api/reports/csv` - Generar reporte CSV
- `POST /api/reports/pdf` - Generar reporte PDF

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

## ✅ BACKEND FUNCIONANDO CORRECTAMENTE

### Estado Actual
- ✅ PHP 8.4.11 instalado
- ✅ Composer funcionando
- ✅ Firebase SDK instalado
- ✅ Servidor ejecutándose en http://localhost:8000
- ✅ Health check funcionando

### Comando para iniciar servidor:
```bash
php -S localhost:8000 -t "C:\Users\scarl\OneDrive\Escritorio\LP2P\ProyectoLP_2P\backend\public" "C:\Users\scarl\OneDrive\Escritorio\LP2P\ProyectoLP_2P\backend\public\router.php"
```

### Endpoints disponibles:
- GET http://localhost:8000/health
- GET http://localhost:8000/species (pendiente)
- POST http://localhost:8000/species (pendiente)

## Próximos Pasos

1. ✅ Instalar PHP y Composer
2. ✅ Ejecutar los comandos de instalación  
3. ⏳ Configurar Firebase en Google Console
4. ⏳ Obtener credenciales de Google Maps API
5. ⏳ Configurar variables de entorno reales
6. ⏳ Implementar controladores completos
7. ⏳ Probar endpoints con el frontend Angular
