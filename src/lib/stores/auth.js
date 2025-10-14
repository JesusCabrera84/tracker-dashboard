import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { dev } from '$app/environment';

// Flag de bypass: permite saltar autenticación en entornos de demo/maqueta
const BYPASS = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BYPASS_AUTH === 'true';

// Mock user para desarrollo
const mockUser = {
	id: 1,
	name: 'Usuario Dev',
	email: 'dev@tracker-monitor.com'
};

// Crear el store para el usuario autenticado
function createAuthStore() {
	const { subscribe, set, update } = writable(null);

	return {
		subscribe,
		login: (userData) => {
			set(userData);
			if (browser) {
				localStorage.setItem('user', JSON.stringify(userData));
			}
		},
		logout: () => {
			set(null);
			if (browser) {
				localStorage.removeItem('user');
				localStorage.removeItem('token');
			}
		},
		init: () => {
			if (browser) {
				// Solo con BYPASS, autenticar mock automáticamente
				if (BYPASS) {
					console.log('🔧 Bypass de autenticación activo: usuario mock autenticado');
					set(mockUser);
					localStorage.setItem('user', JSON.stringify(mockUser));
					return;
				}

				// En ejecución normal, verificar localStorage
				const userData = localStorage.getItem('user');
				if (userData) {
					set(JSON.parse(userData));
				}
			}
		}
	};
}

export const user = createAuthStore();

// Store para el token de autenticación
function createTokenStore() {
	const { subscribe, set } = writable(null);

	return {
		subscribe,
		setToken: (token) => {
			set(token);
			if (browser) {
				localStorage.setItem('token', token);
			}
		},
		getToken: () => {
			if (browser) {
				// Solo con BYPASS, devolver token mock
				if (BYPASS) {
					return 'mock-dev-token';
				}
				return localStorage.getItem('token');
			}
			return null;
		},
		clearToken: () => {
			set(null);
			if (browser) {
				localStorage.removeItem('token');
			}
		},
		init: () => {
			if (browser && BYPASS) {
				// Solo con BYPASS, establecer token mock
				set('mock-dev-token');
				localStorage.setItem('token', 'mock-dev-token');
			}
		}
	};
}

export const authToken = createTokenStore();
