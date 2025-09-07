<script>
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { user, authToken } from '$lib/stores/auth.js';
	import * as GoogleMapsLoader from '@googlemaps/js-api-loader';
	import { darkBlueCarStyle, DBLUE } from '$lib/mapStyles';

	let mapElement;
	let map;
	let isLoading = true;
	let userData = null;
	let showVehiclePanel = false;

	// Configuración de Google Maps
	const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC_NFPQKCUYcCq4WLTTOmSLnfQmRmPYE-8';

	onMount(async () => {
		// Verificar autenticación
		user.init();
		const unsubscribe = user.subscribe((data) => {
			userData = data;
			if (!data) {
				goto('/login');
				return;
			}
		});

		// Inicializar Google Maps
		await initializeMap();

		return () => {
			unsubscribe();
		};
	});

	async function initializeMap() {
		try {
			const loader = new GoogleMapsLoader.Loader({
				apiKey: GOOGLE_MAPS_API_KEY,
				version: 'weekly',
				libraries: ['places']
			});

			const google = await loader.load();
			
			// Configuración inicial del mapa
			const mapOptions = {
				center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México por defecto
				zoom: 13,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				fullscreenControl: true,
				streetViewControl: false,
				mapTypeControl: false,
				zoomControl: true,
				styles: darkBlueCarStyle,
				backgroundColor: DBLUE.bg,
				disableDefaultUI: true
			};

			map = new google.maps.Map(mapElement, mapOptions);

			// Intentar obtener la ubicación actual del usuario
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const userLocation = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						};
						
						map.setCenter(userLocation);
						
						// Agregar marcador en la ubicación actual
						new google.maps.Marker({
							position: userLocation,
							map: map,
							title: 'Tu ubicación actual',
							icon: {
								url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
										<circle cx="12" cy="12" r="3" fill="white"/>
									</svg>
								`),
								scaledSize: new google.maps.Size(24, 24),
								anchor: new google.maps.Point(12, 12)
							}
						});
					},
					(error) => {
						console.warn('Error obteniendo ubicación:', error);
					}
				);
			}

			isLoading = false;
		} catch (error) {
			console.error('Error inicializando Google Maps:', error);
			isLoading = false;
		}
	}

	function handleLogout() {
		user.logout();
		authToken.clearToken();
		goto('/login');
	}

	function toggleVehiclePanel() {
		showVehiclePanel = !showVehiclePanel;
	}
</script>

<svelte:head>
	<title>Dashboard - Tracker Monitor</title>
</svelte:head>


<div class="h-screen w-screen relative overflow-hidden bg-gray-900">
    
    <!-- Usuario en la esquina superior derecha - Fijo y superpuesto -->
    <div class="user-menu">
        <!-- Icono de usuario -->
        <div class="user-icon">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
        </div>
        <!-- Nombre del usuario -->
        {#if userData}
            <span class="user-name">{userData.name}</span>
        {/if}
    </div>

    <!-- Icono de vehículo en el lado izquierdo -->
    <div class="nav-bar">
        <!-- Botón del vehículo -->
        <button 
            on:click={toggleVehiclePanel}
            aria-label="Abrir panel de control de vehículos"
            class="nav-button"
        >
		<svg class="menu-icon" fill="currentColor" viewBox="-12.29 -12.29 147.46 147.46" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="enable-background:new 0 0 122.88 92.02" xml:space="preserve" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)">
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
			<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="4.9152000000000005"></g>
			<g id="SVGRepo_iconCarrier">
				<style type="text/css">  .st0{fill-rule:evenodd;clip-rule:evenodd;}  </style> 
				<g> 
					<path class="st0" d="M10.17,34.23c-10.98-5.58-9.72-11.8,1.31-11.15l2.47,4.63l5.09-15.83C21.04,5.65,24.37,0,30.9,0H96 c6.53,0,10.29,5.54,11.87,11.87l3.82,15.35l2.2-4.14c11.34-0.66,12.35,5.93,0.35,11.62l1.95,2.99c7.89,8.11,7.15,22.45,5.92,42.48 v8.14c0,2.04-1.67,3.71-3.71,3.71h-15.83c-2.04,0-3.71-1.67-3.71-3.71v-4.54H24.04v4.54c0,2.04-1.67,3.71-3.71,3.71H4.5 c-2.04,0-3.71-1.67-3.71-3.71V78.2c0-0.2,0.02-0.39,0.04-0.58C-0.37,62.25-2.06,42.15,10.17,34.23L10.17,34.23z M30.38,58.7 l-14.06-1.77c-3.32-0.37-4.21,1.03-3.08,3.89l1.52,3.69c0.49,0.95,1.14,1.64,1.9,2.12c0.89,0.55,1.96,0.82,3.15,0.87l12.54,0.1 c3.03-0.01,4.34-1.22,3.39-4C34.96,60.99,33.18,59.35,30.38,58.7L30.38,58.7z M54.38,52.79h14.4c0.85,0,1.55,0.7,1.55,1.55l0,0 c0,0.85-0.7,1.55-1.55,1.55h-14.4c-0.85,0-1.55-0.7-1.55-1.55l0,0C52.82,53.49,53.52,52.79,54.38,52.79L54.38,52.79z M89.96,73.15 h14.4c0.85,0,1.55,0.7,1.55,1.55l0,0c0,0.85-0.7,1.55-1.55,1.55h-14.4c-0.85,0-1.55-0.7-1.55-1.55l0,0 C88.41,73.85,89.1,73.15,89.96,73.15L89.96,73.15z M92.5,58.7l14.06-1.77c3.32-0.37,4.21,1.03,3.08,3.89l-1.52,3.69 c-0.49,0.95-1.14,1.64-1.9,2.12c-0.89,0.55-1.96,0.82-3.15,0.87l-12.54,0.1c-3.03-0.01-4.34-1.22-3.39-4 C87.92,60.99,89.7,59.35,92.5,58.7L92.5,58.7z M18.41,73.15h14.4c0.85,0,1.55,0.7,1.55,1.55l0,0c0,0.85-0.7,1.55-1.55,1.55h-14.4 c-0.85,0-1.55-0.7-1.55-1.55l0,0C16.86,73.85,17.56,73.15,18.41,73.15L18.41,73.15z M19.23,31.2h86.82l-3.83-15.92 c-1.05-4.85-4.07-9.05-9.05-9.05H33.06c-4.97,0-7.52,4.31-9.05,9.05L19.23,31.2v0.75V31.2L19.23,31.2z"></path> 
				</g>
			</g>
		</svg>
            
        </button>
		
        <!-- Panel de controles expandible -->
        {#if showVehiclePanel}
            <div class="menu-card">
                <!-- Controles del panel -->
                <div class="controls">
                    <button class="large-button  bg-green-600 hover:bg-green-700">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                        </svg>
                        Ver Todos los Vehículos
                    </button>
                    
                    <button class="large-button bg-blue-600 hover:bg-blue-700">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        Rastrear Vehículo
                    </button>
                    
                    <button class="large-button bg-yellow-500 hover:bg-yellow-600">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                        Filtros
                    </button>
                    
                    <button class="large-button  bg-red-600 hover:bg-red-700 ">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clip-rule="evenodd" />
                        </svg>
                        Limpiar Mapa
                    </button>
                </div>

                <!-- Información adicional -->
                <div class="mt-4 p-3 bg-gray-50/80 rounded-lg">
                    <p class="text-xs text-gray-600 font-medium mb-1">Estado del Sistema</p>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span class="text-xs text-gray-700">Conectado - 3 vehículos activos</span>
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- Contenedor del mapa -->
    <div class="map-wrap">
        {#if isLoading}
            <div class="flex items-center justify-center h-full bg-gray-100/50">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Cargando mapa...</p>
                </div>
            </div>
        {/if}
        
        <div bind:this={mapElement} class="map-canvas"></div>
		<div class="vignette pointer-events-none"></div>
    </div>
</div>
