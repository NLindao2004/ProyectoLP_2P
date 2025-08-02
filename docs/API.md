# API Documentation - Terraverde Backend

## Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-domain.com/api`

## Authentication
La API utiliza JWT tokens para endpoints protegidos.

### Headers requeridos
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

## Endpoints

### 🏥 Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "service": "Terraverde API",
  "version": "1.0.0",
  "timestamp": "2024-08-02T23:06:17.000Z"
}
```

### 🔐 Authentication

#### Register User
```http
POST /auth/register
```
**Body:**
```json
{
  "name": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login
```http
POST /auth/login
```
**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "Usuario Ejemplo",
      "email": "usuario@ejemplo.com"
    }
  }
}
```

#### Logout
```http
POST /auth/logout
```
*Requires authentication*

### 🐛 Species Management

#### List Species
```http
GET /species?ecosystem=forest&region=Costa&family=Felidae&date_from=2024-01-01&date_to=2024-12-31
```
**Query Parameters:**
- `ecosystem`: forest, lake, beach
- `scientific_name`: Partial match
- `common_name`: Partial match
- `family`: Exact match
- `region`: Exact match
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "species_id_123",
      "scientific_name": "Panthera onca",
      "common_name": "Jaguar",
      "description": "Gran felino americano...",
      "ecosystem": "forest",
      "family": "Felidae",
      "region": "Amazonia",
      "latitude": -2.1833,
      "longitude": -77.8833,
      "images": [
        "https://storage.googleapis.com/bucket/image1.jpg"
      ],
      "observation_date": "2024-08-01",
      "created_at": "2024-08-02T10:30:00Z"
    }
  ],
  "message": "Especies obtenidas exitosamente"
}
```

#### Get Species by ID
```http
GET /species/{id}
```

#### Create Species
```http
POST /species
```
*Requires authentication*

**Body (multipart/form-data):**
```
scientific_name: "Panthera onca"
common_name: "Jaguar"
description: "Gran felino americano encontrado en selvas tropicales"
ecosystem: "forest"
family: "Felidae"
region: "Amazonia"
latitude: -2.1833
longitude: -77.8833
observation_date: "2024-08-01"
images[]: [File]
images[]: [File]
```

#### Update Species
```http
PUT /species/{id}
```
*Requires authentication*

#### Delete Species
```http
DELETE /species/{id}
```
*Requires authentication*

#### Get Statistics
```http
GET /species/statistics
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total_species": 150,
    "by_ecosystem": {
      "forest": 80,
      "lake": 45,
      "beach": 25
    },
    "by_family": {
      "Felidae": 15,
      "Orchidaceae": 25,
      "Bromeliaceae": 18
    },
    "by_region": {
      "Amazonia": 60,
      "Costa": 45,
      "Sierra": 30,
      "Galápagos": 15
    },
    "recent_additions": [...]
  }
}
```

### 📊 Reports

#### Get Report Data
```http
POST /reports/data
```
**Body:**
```json
{
  "ecosystem": "forest",
  "region": "Amazonia",
  "date_from": "2024-01-01",
  "date_to": "2024-12-31"
}
```

#### Generate CSV Report
```http
POST /reports/csv
```
**Body:** Same as report data
**Response:** CSV file download

#### Generate PDF Report
```http
POST /reports/pdf
```
**Body:** Same as report data
**Response:** PDF file download

### 🛠️ Utilities

#### Get Ecosystems
```http
GET /utils/ecosystems
```
**Response:**
```json
{
  "success": true,
  "data": [
    {"value": "forest", "label": "Bosque", "icon": "🌲"},
    {"value": "lake", "label": "Lago", "icon": "🏞️"},
    {"value": "beach", "label": "Playa", "icon": "🏖️"}
  ]
}
```

#### Get Regions
```http
GET /utils/regions
```
**Response:**
```json
{
  "success": true,
  "data": ["Costa", "Sierra", "Amazonia", "Galápagos"]
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting
- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute
- **Report generation**: 5 requests per minute

## File Upload Specifications

### Images
- **Formats**: JPEG, PNG, JPG, GIF
- **Max size**: 5MB per image
- **Max images per species**: 10
- **Dimensions**: Recommended minimum 800x600px

### Storage
- Images are stored in Firebase Storage
- Automatic optimization and compression
- CDN delivery for fast loading

## Examples

### Upload Species with Images (cURL)
```bash
curl -X POST http://localhost:8000/api/species \
  -H "Authorization: Bearer your_jwt_token" \
  -F "scientific_name=Panthera onca" \
  -F "common_name=Jaguar" \
  -F "description=Gran felino americano" \
  -F "ecosystem=forest" \
  -F "family=Felidae" \
  -F "region=Amazonia" \
  -F "latitude=-2.1833" \
  -F "longitude=-77.8833" \
  -F "observation_date=2024-08-01" \
  -F "images[]=@jaguar1.jpg" \
  -F "images[]=@jaguar2.jpg"
```

### Filter Species (JavaScript)
```javascript
const response = await fetch('http://localhost:8000/api/species?' + 
  new URLSearchParams({
    ecosystem: 'forest',
    region: 'Amazonia',
    family: 'Felidae'
  }));
const data = await response.json();
console.log(data.data); // Array of species
```

### Generate Report (JavaScript)
```javascript
const response = await fetch('http://localhost:8000/api/reports/csv', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ecosystem: 'forest',
    date_from: '2024-01-01',
    date_to: '2024-12-31'
  })
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'especies_reporte.csv';
a.click();
```

## Testing

### Using Postman
1. Import collection from `/docs/postman/Terraverde_API.postman_collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:8000/api
   - `jwt_token`: Your authentication token

### API Testing Tools
- **Postman**: Full collection available
- **Insomnia**: REST client alternative  
- **cURL**: Command line testing
- **HTTPie**: User-friendly command line client

## SDK Support

### JavaScript/TypeScript
The frontend Angular service (`species.service.ts`) serves as reference implementation.

### PHP
Direct integration with Laravel HTTP client:
```php
$response = Http::withHeaders([
    'Authorization' => 'Bearer ' . $token
])->get('http://localhost:8000/api/species');
```

## Webhooks (Future Implementation)
- Species creation notifications
- Report generation completion
- System health alerts

## Changelog
- **v1.0.0** - Initial API release
- **v1.1.0** - Added statistics endpoint
- **v1.2.0** - Enhanced filtering capabilities
- **v1.3.0** - Added report generation
