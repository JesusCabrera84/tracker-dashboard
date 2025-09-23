import { writable, derived } from 'svelte/store';
import { apiService } from '$lib/services/api.js';
import { positionService } from '$lib/services/positionService.js';

// Estado principal de vehículos
export const vehicles = writable([]);
export const selectedVehicles = writable([]);
export const loadingVehicles = writable(false);
export const vehiclePositions = writable(new Map());
export const loadingPositions = writable(false);

// Configuración de vehículos con sus deviceIds
const VEHICLE_CONFIG = [
	{
		id: 'VH001',
		name: 'Unidad Principal',
		driver: 'Conductor Asignado',
		deviceId: '0848086072', // Tu deviceId real
		status: 'active',
		location: 'En ruta'
	}
];

// Datos de ejemplo para fallback (sin el deviceId real)
const EXAMPLE_VEHICLES = [
	{
		id: 'VH002',
		name: 'Van de Servicios #2',
		driver: 'María González',
		status: 'inactive',
		location: 'Centro',
		lastUpdate: '2025-01-07T00:45:00Z',
		deviceId: '0848086072',
		speed: 0,
		fuel: 92
	},
	{
		id: 'VH003',
		name: 'Pickup #3',
		driver: 'Carlos Rodríguez',
		status: 'active',
		location: 'Zona Sur',
		lastUpdate: '2025-01-07T01:05:00Z',
		speed: 32,
		fuel: 45,
		deviceId: '0848086072'
	},
	{
		id: 'VH004',
		name: 'Camión Pesado #4',
		driver: 'Ana López',
		status: 'maintenance',
		location: 'Taller Central',
		lastUpdate: '2025-01-06T18:30:00Z',
		speed: 0,
		fuel: 15,
		deviceId: '0848086072'
	}
];

// Store derivado para vehículos activos
export const activeVehicles = derived(vehicles, ($vehicles) =>
	$vehicles.filter((vehicle) => vehicle.status === 'active')
);

// Store derivado para contar vehículos seleccionados
export const selectedVehicleCount = derived(selectedVehicles, ($selected) => $selected.length);

// Funciones para manejar vehículos
export const vehicleActions = {
	// Cargar vehículos desde la API
	async loadVehicles() {
		loadingVehicles.set(true);
		try {
			// Intentar cargar desde la API principal
			const response = await apiService.getVehicles();
			const apiVehicles = response.vehicles || response || [];

			// Combinar con vehículos configurados
			const allVehicles = [...VEHICLE_CONFIG, ...apiVehicles, ...EXAMPLE_VEHICLES];
			vehicles.set(allVehicles);

			// Cargar posiciones para vehículos con deviceId
			await this.loadVehiclePositions();
		} catch (error) {
			console.warn('Error cargando vehículos desde API, usando configuración local:', error);
			vehicles.set([...VEHICLE_CONFIG, ...EXAMPLE_VEHICLES]);
			await this.loadVehiclePositions();
		} finally {
			loadingVehicles.set(false);
		}
	},

	// Cargar posiciones de vehículos
	async loadVehiclePositions() {
		loadingPositions.set(true);
		try {
			const currentVehicles = await new Promise((resolve) => {
				const unsubscribe = vehicles.subscribe((v) => {
					resolve(v);
					unsubscribe();
				});
			});

			const vehiclesWithDeviceId = currentVehicles.filter((v) => v.deviceId);
			const deviceIds = vehiclesWithDeviceId.map((v) => v.deviceId);

			if (deviceIds.length > 0) {
				const positions = await positionService.getMultiplePositions(deviceIds);
				const positionMap = new Map();

				positions.forEach((position) => {
					if (position) {
						positionMap.set(position.deviceId, position);
					}
				});

				vehiclePositions.set(positionMap);

				// Actualizar vehículos con datos de posición
				const updatedVehicles = currentVehicles.map((vehicle) => {
					if (vehicle.deviceId) {
						const position = positionMap.get(vehicle.deviceId);
						if (position) {
							return {
								...vehicle,
								latitude: position.latitude,
								longitude: position.longitude,
								speed: position.speed,
								battery: position.battery,
								status: position.isOnline ? 'active' : 'inactive',
								lastUpdate: position.lastUpdate,
								lastUpdateFormatted: position.lastUpdateFormatted,
								coordinates: position.coordinates
							};
						}
					}
					return vehicle;
				});

				vehicles.set(updatedVehicles);
			}
		} catch (error) {
			console.error('Error cargando posiciones:', error);
		} finally {
			loadingPositions.set(false);
		}
	},

	// Actualizar posición de un vehículo específico
	async updateVehiclePosition(deviceId) {
		try {
			const position = await positionService.getLastPosition(deviceId);

			vehiclePositions.update((positions) => {
				const newPositions = new Map(positions);
				newPositions.set(deviceId, position);
				return newPositions;
			});

			// Actualizar el vehículo en la lista
			vehicles.update((vehicleList) => {
				return vehicleList.map((vehicle) => {
					if (vehicle.deviceId === deviceId) {
						return {
							...vehicle,
							latitude: position.latitude,
							longitude: position.longitude,
							speed: position.speed,
							battery: position.battery,
							status: position.isOnline ? 'active' : 'inactive',
							lastUpdate: position.lastUpdate,
							lastUpdateFormatted: position.lastUpdateFormatted,
							coordinates: position.coordinates
						};
					}
					return vehicle;
				});
			});

			return position;
		} catch (error) {
			console.error(`Error actualizando posición para ${deviceId}:`, error);
			throw error;
		}
	},

	// Seleccionar/deseleccionar vehículo
	toggleVehicleSelection(vehicleId) {
		selectedVehicles.update((selected) => {
			if (selected.includes(vehicleId)) {
				return selected.filter((id) => id !== vehicleId);
			} else {
				return [...selected, vehicleId];
			}
		});
	},

	// Seleccionar todos los vehículos
	selectAllVehicles() {
		vehicles.subscribe((vehicleList) => {
			selectedVehicles.set(vehicleList.map((v) => v.id));
		})();
	},

	// Limpiar selección
	clearSelection() {
		selectedVehicles.set([]);
	},

	// Obtener vehículo por ID
	getVehicleById(vehicleId) {
		let foundVehicle = null;
		vehicles.subscribe((vehicleList) => {
			foundVehicle = vehicleList.find((v) => v.id === vehicleId);
		})();
		return foundVehicle;
	}
};
