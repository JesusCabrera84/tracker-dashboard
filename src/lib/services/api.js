import { authToken } from '../stores/auth.js';
import { get } from 'svelte/store';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
	constructor() {
		this.baseURL = API_BASE_URL;
	}

	// Método para hacer peticiones HTTP
	async request(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`;
		const token = get(authToken) || authToken.getToken();

		const config = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		};

		// Agregar token de autorización si existe
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('API request failed:', error);
			throw error;
		}
	}

	// Métodos de autenticación
	async login(credentials) {
		return this.request('/auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials)
		});
	}

	async register(userData) {
		return this.request('/auth/register', {
			method: 'POST',
			body: JSON.stringify(userData)
		});
	}

	async logout() {
		return this.request('/auth/logout', {
			method: 'POST'
		});
	}

	// Método para verificar el token
	async verifyToken() {
		return this.request('/auth/verify');
	}

	// Métodos GET
	async get(endpoint) {
		return this.request(endpoint, { method: 'GET' });
	}

	// Métodos POST
	async post(endpoint, data) {
		return this.request(endpoint, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	// Métodos PUT
	async put(endpoint, data) {
		return this.request(endpoint, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	// Métodos DELETE
	async delete(endpoint) {
		return this.request(endpoint, { method: 'DELETE' });
	}

	// Métodos específicos para vehículos
	async getVehicles() {
		return this.request('/vehicles', { method: 'GET' });
	}

	async getVehicle(vehicleId) {
		return this.request(`/vehicles/${vehicleId}`, { method: 'GET' });
	}

	async getVehicleLocation(vehicleId) {
		return this.request(`/vehicles/${vehicleId}/location`, { method: 'GET' });
	}

	async getVehicleStatus(vehicleId) {
		return this.request(`/vehicles/${vehicleId}/status`, { method: 'GET' });
	}
}

export const apiService = new ApiService();
