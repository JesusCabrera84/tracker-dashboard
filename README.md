# Tracker Monitor App

Una aplicación SvelteKit con autenticación y Google Maps que permite a los usuarios hacer login y ver un mapa que cubre toda la pantalla.

## Características

- Autenticación completa (login/registro)
- Gestión de sesiones con localStorage
- Google Maps integrado a pantalla completa
- Rutas protegidas
- Interfaz moderna con Tailwind CSS
- Integración lista para APIs de FastAPI

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# API Configuration - URL de tu API FastAPI
VITE_API_BASE_URL=http://localhost:8000

# Google Maps API Key - Obtén tu clave en Google Cloud Console
VITE_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps_aqui
```

### 3. Obtener Google Maps API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Maps JavaScript
4. Crea credenciales (API Key)
5. Copia la clave al archivo `.env`

## Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev

# o abre automáticamente en el navegador
npm run dev -- --open
```

## Estructura del Proyecto

```
src/
├── lib/
│   ├── stores/
│   │   └── auth.js          # Store de autenticación
│   └── services/
│       └── api.js           # Servicio para llamadas a FastAPI
├── routes/
│   ├── +layout.svelte       # Layout principal
│   ├── +page.svelte         # Página de inicio (redirección)
│   ├── login/
│   │   └── +page.svelte     # Página de login
│   ├── register/
│   │   └── +page.svelte     # Página de registro
│   └── dashboard/
│       ├── +layout.svelte   # Layout protegido
│       └── +page.svelte     # Dashboard con Google Maps
└── app.css                  # Estilos de Tailwind
```

## Integración con FastAPI

La aplicación está configurada para trabajar con una API FastAPI. Los endpoints esperados son:

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify` - Verificar token

### Ejemplo de respuesta de login:

```json
{
	"access_token": "jwt_token_here",
	"user": {
		"id": 1,
		"name": "Usuario",
		"email": "usuario@email.com"
	}
}
```

## Uso

1. **Página de inicio**: Redirecciona automáticamente según el estado de autenticación
2. **Login/Registro**: Formularios con validación completa
3. **Dashboard**: Mapa de Google Maps a pantalla completa con:
   - Header con información del usuario
   - Botón de logout
   - Detección automática de ubicación
   - Marcador en ubicación actual

## Personalización

### Cambiar ubicación por defecto del mapa

Edita `src/routes/dashboard/+page.svelte`:

```javascript
const mapOptions = {
	center: { lat: TU_LATITUD, lng: TU_LONGITUD },
	zoom: 13
	// ...
};
```

### Agregar nuevos endpoints de API

Edita `src/lib/services/api.js` y agrega nuevos métodos según necesites.

## Construcción

Para crear una versión de producción:

```bash
npm run build
```

Previsualizar la construcción:

```bash
npm run preview
```

## Despliegue

La aplicación puede desplegarse en cualquier plataforma que soporte aplicaciones SvelteKit como Vercel, Netlify, o un servidor tradicional.

Para desplegar, asegúrate de:

1. Configurar las variables de entorno en tu plataforma
2. Instalar un [adapter](https://svelte.dev/docs/kit/adapters) apropiado si es necesario
