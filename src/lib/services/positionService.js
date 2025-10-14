/**
 * Servicio para consultar posiciones de vehículos desde la API
 */

const API_BASE_URL = 'http://34.237.30.30:8080';
// Base para API administrativa de comunicaciones (puede ser distinta)
const COMM_BASE_URL = import.meta.env?.VITE_COMM_BASE_URL || 'http://10.8.0.1:8000';

class PositionService {
	constructor() {
		this.cache = new Map();
		this.cacheTimeout = 30000; // 30 segundos
	}

	/**
	 * Obtiene las últimas comunicaciones por lista de device_ids
	 * @param {string[]} deviceIds - IDs de dispositivos
	 * @returns {Promise<Object>} Respuesta de comunicaciones
	 */
	async getLatestCommunications(deviceIds = []) {
		if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
			return { communications: [] };
		}
		const url = new URL('/api/v1/communications/latest', COMM_BASE_URL);
		deviceIds.forEach((id) => url.searchParams.append('device_ids', id));
		try {
			const res = await fetch(url.toString(), { method: 'GET' });
			if (!res.ok) throw new Error(`HTTP error ${res.status}`);
			return await res.json();
		} catch (err) {
			console.error('Error fetching latest communications:', err);
			throw err;
		}
	}

	/**
	 * Obtiene la última posición de un dispositivo
	 * @param {string} deviceId - ID del dispositivo
	 * @returns {Promise<Object>} Datos de posición
	 */
	async getLastPosition(deviceId) {
		try {
			const cacheKey = `position_${deviceId}`;
			const cached = this.cache.get(cacheKey);

			// Verificar cache
			if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
				return cached.data;
			}

			const response = await fetch(`${API_BASE_URL}/positions?deviceId=${deviceId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Normalizar los datos
			const normalizedData = this.normalizePositionData(data);

			// Guardar en cache
			this.cache.set(cacheKey, {
				data: normalizedData,
				timestamp: Date.now()
			});

			return normalizedData;
		} catch (error) {
			console.error(`Error obteniendo posición para dispositivo ${deviceId}:`, error);
			throw error;
		}
	}

	/**
	 * Obtiene posiciones de múltiples dispositivos
	 * @param {string[]} deviceIds - Array de IDs de dispositivos
	 * @returns {Promise<Object[]>} Array de datos de posición
	 */
	async getMultiplePositions(deviceIds) {
		const promises = deviceIds.map((deviceId) =>
			this.getLastPosition(deviceId).catch((error) => {
				console.warn(`Error obteniendo posición para ${deviceId}:`, error);
				return null;
			})
		);

		const results = await Promise.all(promises);
		return results.filter((result) => result !== null);
	}

	/**
	 * Normaliza los datos de posición de la API
	 * @param {Object} rawData - Datos crudos de la API
	 * @returns {Object} Datos normalizados
	 */
	normalizePositionData(rawData) {
		return {
			deviceId: rawData.deviceId,
			latitude: parseFloat(rawData.latitude),
			longitude: parseFloat(rawData.longitude),
			lastUpdate: rawData.timelastposition,
			altitude: parseFloat(rawData.altitude || 0),
			speed: parseFloat(rawData.speed || 0),
			battery: parseFloat(rawData.battery || 0),
			status: rawData.status || 'Desconocido',
			// Campos adicionales calculados
			isOnline: rawData.status !== 'Apagado',
			lastUpdateFormatted: this.formatLastUpdate(rawData.timelastposition),
			coordinates: {
				lat: parseFloat(rawData.latitude),
				lng: parseFloat(rawData.longitude)
			}
		};
	}

	/**
	 * Formatea la fecha de última actualización
	 * @param {string} dateString - Fecha en formato ISO
	 * @returns {string} Fecha formateada
	 */
	formatLastUpdate(dateString) {
		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffInMinutes = Math.floor((now - date) / (1000 * 60));

			if (diffInMinutes < 1) {
				return 'Hace menos de 1 minuto';
			} else if (diffInMinutes < 60) {
				return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
			} else if (diffInMinutes < 1440) {
				const hours = Math.floor(diffInMinutes / 60);
				return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
			} else {
				const days = Math.floor(diffInMinutes / 1440);
				return `Hace ${days} día${days !== 1 ? 's' : ''}`;
			}
		} catch (error) {
			return 'Fecha inválida';
		}
	}

	/**
	 * Limpia el cache
	 */
	clearCache() {
		this.cache.clear();
	}

	/**
	 * Obtiene el estado del cache
	 */
	getCacheStatus() {
		return {
			size: this.cache.size,
			entries: Array.from(this.cache.keys())
		};
	}
}

export const positionService = new PositionService();
