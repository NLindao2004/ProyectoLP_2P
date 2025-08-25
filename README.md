# Terraverde - Plataforma de Catalogación de Especies

## Descripción del Proyecto

Terraverde es una plataforma web para el registro y catalogación de especies en ecosistemas terrestres y acuáticos. Permite documentar y catalogar especies encontradas en bosques, lagos, playas, etc.

## Integrantes del Grupo
- **Benites Alex** - Galería interactiva e interfaz de mapas
- **Lindao Nehemias** - Registro de especies y consulta de catálogo  
- **Zavala Fernando** - Sección de comentarios y generación de reportes

## Arquitectura del Proyecto

### Frontend
- **Framework**: Angular 17+ con TypeScript
- **Características**: PWA, Responsive Design, Integración con Google Maps
- **Ubicación**: `/frontend`

### Backend  
- **Framework**: PHP 8+ 
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
│   ├── .env                  # Configuracion Firebase
│   ├── routes/               # Rutas API
│   └── config/               # Configuraciones                
└── gitignore/              
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- PHP 8.0+
- Composer
- Angular CLI (`npm install -g @angular/cli`)

### Pasos para ejecutar el proyecto

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/NLindao2004/ProyectoLP_2P.git
   cd ProyectoLP_2P
   ```

2. **Instalar dependencias frontend**
   ```bash
   cd ProyectoLP_2P\frontend
   npm run install-all
   ```

3. **Instalar dependencias backend**
   ```bash
   cd ProyectoLP_2P\backend
   composer install
   ```

4. **Levantar servidor backend**
   ```bash
   cd ProyectoLP_2P\backend
   php -S localhost:8000 -t public/
   ```

5. **Levantar servidor frontend**
   ```bash
   cd ProyectoLP_2P\backend
   ng serve
   ```

## Funcionalidades Principales

### Registro de Especies
- Formulario intuitivo para registrar especies
- Carga de múltiples fotografías
- Geolocalización con Google Maps
- Datos taxonómicos completos

### Catálogo Interactivo
- Búsqueda y filtrado avanzado
- Detalles completos de cada especie
- Galería de imágenes 

### Sistema de Reportes
- Exportación en CSV y PDF
- Análisis por región geográfica
- Filtros personalizables

### Mapas Interactivos
- Visualización de avistamientos
- Filtros geográficos
- Integración con Google Maps API

### Sección de comentarios 
- Enviar comentarios en cada especie registrada
- Visualización de comentarios de otros usuarios 


## APIs y Servicios Externos

- **Google Maps API**: Geolocalización y mapas
- **Firebase Services**: Base de datos, storage y autenticación


## Contacto

**Proyecto Lenguajes de Programación - ESPOL**
- Repositorio: https://github.com/NLindao2004/ProyectoLP_2P
- Desarrollado por: Benites Alex, Lindao Nehemias, Zavala Fernando