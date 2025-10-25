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
		// Mock de login: acepta únicamente usuario "test" y contraseña "test"
		const { email, username, password } = credentials || {};
		const isUserTest =
			email === 'test' || email === 'test@tracker-monitor.com' || username === 'test';
		const isPwdTest = password === 'test';

		return new Promise((resolve, reject) => {
			// pequeña latencia para simular red
			setTimeout(() => {
				if (isUserTest && isPwdTest) {
					resolve({
						access_token: 'fake-demo-token',
						user: {
							id: 1,
							name: 'Usuario Test',
							email: email || 'test@tracker-monitor.com'
						}
					});
				} else {
					reject(new Error('Invalid credentials'));
				}
			}, 400);
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

	// Mock administrativo: obtener dispositivos del usuario
	async getDevices(user) {
		// user puede ser usado en el futuro; por ahora retornamos datos fijos
		const payload = {
			devices: [{ id: '0848063597' }, { id: '867564050638581' }, { id: '0848086072' }]
		};

		return new Promise((resolve) => setTimeout(() => resolve(payload), 300));
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
