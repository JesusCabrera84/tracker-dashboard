import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { dev } from '$app/environment';

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
                // En modo desarrollo, usar mock user automáticamente
                if (dev) {
                    console.log('🔧 Modo desarrollo: Usuario mock autenticado automáticamente');
                    set(mockUser);
                    localStorage.setItem('user', JSON.stringify(mockUser));
                    return;
                }
                
                // En producción, verificar localStorage
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
                // En modo desarrollo, devolver token mock
                if (dev) {
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
            if (browser && dev) {
                // En desarrollo, establecer token mock
                set('mock-dev-token');
                localStorage.setItem('token', 'mock-dev-token');
            }
        }
    };
}

export const authToken = createTokenStore();
