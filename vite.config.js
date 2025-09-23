import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Configuración de Vitest para pruebas
	test: {
		// Usa entorno Node; cambia a 'jsdom' si pruebas DOM/componentes
		environment: 'node',
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		reporter: 'dot'
	},
	// Aseguramos que HMR sea un objeto para evitar "Cannot convert undefined or null to object"
	server: {
		hmr: {}
	}
});
