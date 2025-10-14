import * as GoogleMapsLoader from '@googlemaps/js-api-loader';
import { darkBlueCarStyle, DBLUE, darkGrayMapStyle, DGREY } from '$lib/mapStyles';
import { getStatusBadgeClass } from '$lib/utils/vehicleUtils.js';
import { theme } from '$lib/stores/theme.js';

class MapService {
	constructor() {
		this.map = null;
		this.google = null;
		this.markers = new Map();
		this.unsubscribeTheme = null;
		this.currentTheme = undefined;
		this.apiKey =
			import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC_NFPQKCUYcCq4WLTTOmSLnfQmRmPYE-8';
	}

	async initialize(mapElement) {
		try {
			const loader = new GoogleMapsLoader.Loader({
				apiKey: this.apiKey,
				version: 'weekly',
			});

			this.google = await loader.load();

			// Determine initial theme (SSR-safe fallback)
			const initialTheme =
				typeof document !== 'undefined'
					? document.documentElement?.dataset?.theme || 'modern'
					: 'modern';

			const useModern = initialTheme === 'modern';
			const useDark = initialTheme === 'dark';

			const mapOptions = {
				center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México por defecto
				zoom: 13,
				mapTypeId: this.google.maps.MapTypeId.ROADMAP,
				fullscreenControl: true,
				streetViewControl: false,
				mapTypeControl: false,
				zoomControl: true,
				styles: useModern ? darkBlueCarStyle : useDark ? darkGrayMapStyle : null,
				backgroundColor: useModern ? DBLUE.bg : useDark ? DGREY.bg : '#ffffff',
				disableDefaultUI: true
			};

			this.map = new this.google.maps.Map(mapElement, mapOptions);

			// React to theme changes at runtime
			if (!this.unsubscribeTheme) {
				this.unsubscribeTheme = theme.subscribe((t) => {
					this.currentTheme = t;
					if (this.map) {
						const isModern = t === 'modern';
						const isDark = t === 'dark';
						this.map.setOptions({
							styles: isModern ? darkBlueCarStyle : isDark ? darkGrayMapStyle : null,
							backgroundColor: isModern ? DBLUE.bg : isDark ? DGREY.bg : '#ffffff'
						});
					}
				});
			}

			// Intentar obtener la ubicación actual del usuario
			await this.setUserLocation();

			return this.map;
		} catch (error) {
			console.error('Error inicializando Google Maps:', error);
			throw error;
		}
	}

	async setUserLocation() {
		if (!navigator.geolocation) return;

		return new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const userLocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};

					this.map.setCenter(userLocation);
					this.addUserLocationMarker(userLocation);
					resolve(userLocation);
				},
				(error) => {
					console.warn('Error obteniendo ubicación:', error);
					resolve(null);
				}
			);
		});
	}

	addUserLocationMarker(location) {
		if (!this.google || !this.map) return;

		const marker = new this.google.maps.Marker({
			position: location,
			map: this.map,
			title: 'Tu ubicación actual',
			icon: {
				url:
					'data:image/svg+xml;charset=UTF-8,' +
					encodeURIComponent(`
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
						<circle cx="12" cy="12" r="3" fill="white"/>
					</svg>
				`),
				scaledSize: new this.google.maps.Size(24, 24),
				anchor: new this.google.maps.Point(12, 12)
			}
		});

		this.markers.set('user-location', marker);
		return marker;
	}

	addVehicleMarker(vehicle) {
		// Verificar que tenemos coordenadas válidas
		const lat = vehicle.latitude || vehicle.latitude;
		const lng = vehicle.longitude || vehicle.longitude;

		if (!this.google || !this.map || !lat || !lng) {
			console.warn('No se pueden agregar marcadores sin coordenadas válidas:', vehicle);
			return;
		}

		const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

		const marker = new this.google.maps.Marker({
			position: position,
			map: this.map,
			title: vehicle.device_id,
			icon: {
				url:
					'data:image/svg+xml;charset=UTF-8,' +
					encodeURIComponent(`
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="16" cy="16" r="14" fill="${this.getVehicleColor(vehicle.status)}" stroke="white" stroke-width="2"/>
						<path d="M8 16h16M12 12h8M12 20h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
					</svg>
				`),
				scaledSize: new this.google.maps.Size(32, 32),
				anchor: new this.google.maps.Point(16, 16)
			}
		});

		// Agregar info window
		const infoWindow = new this.google.maps.InfoWindow({
			content: this.createVehicleInfoContent(vehicle)
		});

		marker.addListener('click', () => {
			infoWindow.open(this.map, marker);
		});

		this.markers.set(vehicle.id, { marker, infoWindow });
		return marker;
	}

	getVehicleColor(status) {
		switch (status) {
			case 'active':
				return '#10B981'; // green
			case 'inactive':
				return '#EF4444'; // red
			case 'maintenance':
				return '#F59E0B'; // yellow
			default:
				return '#6B7280'; // gray
		}
	}

	createVehicleInfoContent(vehicle) {
		console.warn('Vehicle info:', vehicle);
		const speed = vehicle.speed || 0;
		const battery = vehicle.main_battery_voltage || 0;
		const batteryDevice = vehicle.backup_battery_voltage || 0;
		const lastUpdate = vehicle.gps_datetime || 'No disponible';

		return `
			<div class="p-3 min-w-48 text-app">
				<h3 class="font-semibold text-app mb-2">${vehicle.device_id}</h3>
				<div class="space-y-1 text-sm text-app">
					<p><span class="font-medium text-app">Estado:</span> 
						<span class="px-2 py-1 text-xs ${getStatusBadgeClass(vehicle.status)}">
							${this.getStatusText(vehicle.status)}
						</span>
					</p>
					<p><span class="font-medium text-app">Velocidad:</span> ${speed} km/h</p>
					<p><span class="font-medium text-app">Batería:</span> ${battery} V</p>
					<p><span class="font-medium text-app">Bater&iacute;a dispositivo:</span> ${batteryDevice || 0} V</p>
					${vehicle.device_id ? `<p><span class=\"font-medium text-app\">Device ID:</span> ${vehicle.device_id}</p>` : ''}
					<p><span class="font-medium text-app">Última actualización:</span> ${lastUpdate}</p>
					${
						vehicle.latitude && vehicle.longitude
							? `<p><span class=\"font-medium text-app\">Coordenadas:</span> ${vehicle.latitude}, ${vehicle.longitude}</p>`
							: ''
					}
				</div>
			</div>
		`;
	}

	getStatusClasses(status) {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'inactive':
				return 'bg-red-100 text-red-800';
			case 'maintenance':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	getStatusText(status) {
		switch (status) {
			case 'active':
				return 'Activo';
			case 'inactive':
				return 'Inactivo';
			case 'maintenance':
				return 'Mantenimiento';
			default:
				return 'Desconocido';
		}
	}

	removeMarker(id) {
		const markerData = this.markers.get(id);
		if (markerData) {
			markerData.marker.setMap(null);
			this.markers.delete(id);
		}
	}

	clearAllMarkers() {
		this.markers.forEach((markerData) => {
			markerData.marker.setMap(null);
		});
		this.markers.clear();
	}

	// Agregar múltiples marcadores de vehículos
	addVehicleMarkers(vehicles) {
		if (!Array.isArray(vehicles)) return;

		vehicles.forEach((vehicle) => {
			this.addVehicleMarker(vehicle);
		});
	}

	// Actualizar marcador de vehículo existente
	updateVehicleMarker(vehicle) {
		const existingMarkerData = this.markers.get(vehicle.device_id);

		if (existingMarkerData) {
			// Actualizar posición
			const lat = vehicle.latitude || vehicle.lat;
			const lng = vehicle.longitude || vehicle.lng;

			if (lat && lng) {
				const newPosition = { lat: parseFloat(lat), lng: parseFloat(lng) };
				existingMarkerData.marker.setPosition(newPosition);

				// Actualizar contenido del info window
				existingMarkerData.infoWindow.setContent(this.createVehicleInfoContent(vehicle));

				// Actualizar color del marcador según el estado
				existingMarkerData.marker.setIcon({
					url:
						'data:image/svg+xml;charset=UTF-8,' +
						encodeURIComponent(`
						<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="16" cy="16" r="14" fill="${this.getVehicleColor(vehicle.status)}" stroke="white" stroke-width="2"/>
							<path d="M8 16h16M12 12h8M12 20h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
						</svg>
					`),
					scaledSize: new this.google.maps.Size(32, 32),
					anchor: new this.google.maps.Point(16, 16)
				});
			}
		} else {
			// Si no existe, crear nuevo marcador
			this.addVehicleMarker(vehicle);
		}
	}

	centerOnVehicles(vehicles) {
		if (!vehicles.length || !this.map) return;

		const bounds = new this.google.maps.LatLngBounds();
		let hasValidCoordinates = false;

		vehicles.forEach((vehicle) => {
			const lat = vehicle.latitude || vehicle.lat;
			const lng = vehicle.longitude || vehicle.lng;

			if (lat && lng) {
				bounds.extend({ lat: parseFloat(lat), lng: parseFloat(lng) });
				hasValidCoordinates = true;
			}
		});

		if (hasValidCoordinates) {
			this.map.fitBounds(bounds);
		}
	}

	// Centrar en un vehículo específico
	centerOnVehicle(vehicle) {
		const lat = vehicle.latitude || vehicle.lat;
		const lng = vehicle.longitude || vehicle.lng;

		if (lat && lng && this.map) {
			this.map.setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
			this.map.setZoom(15);
		}
	}

	setCenter(lat, lng) {
		if (this.map) {
			this.map.setCenter({ lat, lng });
		}
	}

	setZoom(zoom) {
		if (this.map) {
			this.map.setZoom(zoom);
		}
	}
}

export const mapService = new MapService();
