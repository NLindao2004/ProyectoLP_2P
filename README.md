# Terraverde - Plataforma de Catalogación de Especies

## Descripción del Proyecto

Terraverde es una plataforma web para el registro y catalogación de especies en ecosistemas terrestres y acuáticos. Permite a biólogos, investigadores, estudiantes y ciudadanos documentar y catalogar especies encontradas en bosques, lagos y playas.

## Integrantes del Grupo
- **Benites Alex** - Galería interactiva e interfaz de mapas
- **Lindao Nehemias** - Registro de especies y consulta de catálogo  
- **Zavala Fernando** - PWA y generación de reportes

## Arquitectura del Proyecto

### Frontend
- **Framework**: Angular 17+ con TypeScript
- **Características**: PWA, Responsive Design, Integración con Google Maps
- **Ubicación**: `/frontend`

### Backend  
- **Framework**: PHP 8+ con Laravel
- **API**: REST API para comunicación con frontend
- **Ubicación**: `/backend`

### Base de Datos
- **Firebase Firestore**: Base de datos NoSQL
- **Firebase Storage**: Almacenamiento de imágenes
- **Firebase Authentication**: Gestión de usuarios

## Estructura del Proyecto

```
ProyectoLP_2P/
├── frontend/                 # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Componentes reutilizables
│   │   │   ├── pages/        # Páginas principales
│   │   │   ├── services/     # Servicios Angular
│   │   │   └── models/       # Modelos TypeScript
│   │   ├── assets/           # Recursos estáticos
│   │   └── environments/     # Configuraciones de entorno
├── backend/                  # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/ # Controladores API
│   │   ├── Models/           # Modelos Eloquent
│   │   └── Services/         # Servicios Firebase
│   ├── routes/               # Rutas API
│   └── config/               # Configuraciones
├── docs/                     # Documentación
└── firebase/                 # Configuración Firebase
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- PHP 8.0+
- Composer
- Angular CLI (`npm install -g @angular/cli`)

### Configuración del Proyecto

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/NLindao2004/ProyectoLP_2P.git
   cd ProyectoLP_2P
   ```

2. **Instalar dependencias**
   ```bash
   npm run install-all
   ```

3. **Configurar Firebase**
   - Crear proyecto en Firebase Console
   - Configurar Firestore Database
   - Configurar Firebase Storage
   - Obtener las credenciales de configuración

4. **Configurar variables de entorno**
   - Frontend: `frontend/src/environments/environment.ts`
   - Backend: `backend/.env`

### Ejecución en Desarrollo

```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# O ejecutar por separado:
npm run start-frontend  # Puerto 4200
npm run start-backend   # Puerto 8000
```

## Funcionalidades Principales

### 🌱 Registro de Especies
- Formulario intuitivo para registrar especies
- Carga de múltiples fotografías
- Geolocalización con Google Maps
- Datos taxonómicos completos

### 🔍 Catálogo Interactivo
- Búsqueda y filtrado avanzado
- Vista por ecosistema (bosque, lago, playa)
- Detalles completos de cada especie
- Galería de imágenes con zoom

### 📊 Sistema de Reportes
- Exportación en CSV y PDF
- Análisis por región geográfica
- Estadísticas de biodiversidad
- Filtros personalizables

### 🗺️ Mapas Interactivos
- Visualización de avistamientos
- Filtros geográficos
- Integración con Google Maps API

### 📱 PWA (Progressive Web App)
- Instalación en dispositivos
- Funcionamiento offline
- Caché inteligente
- Responsive design

## APIs y Servicios Externos

- **Google Maps API**: Geolocalización y mapas
- **Firebase Services**: Base de datos, storage y autenticación
- **Cloudinary** (opcional): Optimización de imágenes

## Tecnologías Utilizadas

### Frontend
- Angular 17+
- TypeScript
- Angular Material
- PWA Service Worker
- Google Maps API

### Backend
- PHP 8+
- Laravel Framework
- Firebase SDK
- JWT Authentication

### Base de Datos
- Firebase Firestore (NoSQL)
- Firebase Storage

## Contribución

1. Fork del proyecto
2. Crear rama para nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Contacto

**Proyecto Lenguajes de Programación - Universidad**
- Repositorio: https://github.com/NLindao2004/ProyectoLP_2P
- Desarrollado por: Benites Alex, Lindao Nehemias, Zavala Fernando