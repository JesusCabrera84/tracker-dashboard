<script>
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { user, authToken } from '$lib/stores/auth.js';
	import { apiService } from '$lib/services/api.js';
	import * as GoogleMapsLoader from '@googlemaps/js-api-loader';
	import { darkBlueCarStyle, DBLUE } from '$lib/mapStyles';

	let mapElement;
	let map;
	let isLoading = true;
	let userData = null;
	let showVehiclePanel = false;
	let showUserPanel = false;
	let showVehicleList = false;
	let vehicles = [];
	let loadingVehicles = false;
	let selectedVehicles = [];

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

	function toggleUserPanel() {
		showUserPanel = !showUserPanel;
	}

	async function toggleVehicleList() {
		showVehicleList = !showVehicleList;
		
		// Si se está abriendo la lista y no hay vehículos cargados, cargarlos
		if (showVehicleList && vehicles.length === 0) {
			await loadVehicles();
		}
	}

	function toggleVehicleSelection(vehicleId) {
		if (selectedVehicles.includes(vehicleId)) {
			selectedVehicles = selectedVehicles.filter(id => id !== vehicleId);
		} else {
			selectedVehicles = [...selectedVehicles, vehicleId];
		}
	}

	function selectAllVehicles() {
		selectedVehicles = vehicles.map(v => v.id);
	}

	function clearVehicleSelection() {
		selectedVehicles = [];
	}

	function getStatusColor(status) {
		switch (status) {
			case 'active':
				return 'text-green-600';
			case 'inactive':
				return 'text-red-600';
			case 'maintenance':
				return 'text-yellow-600';
			default:
				return 'text-gray-600';
		}
	}

	function getStatusText(status) {
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

	function handleLogout() {
		user.logout();
		goto('/login');
	}

	async function loadVehicles() {
		loadingVehicles = true;
		try {
			// Intentar cargar desde la API
			const response = await apiService.getVehicles();
			vehicles = response.vehicles || response || [];
		} catch (error) {
			console.warn('Error cargando vehículos desde API, usando datos de ejemplo:', error);
			// Datos de ejemplo si la API no está disponible
			vehicles = [
				{
					id: 'VH001',
					name: 'Camión de Reparto #1',
					driver: 'Juan Pérez',
					status: 'active',
					location: 'Zona Norte',
					lastUpdate: '2025-01-07T01:00:00Z',
					speed: 45,
					fuel: 78
				},
				{
					id: 'VH002',
					name: 'Van de Servicios #2',
					driver: 'María González',
					status: 'inactive',
					location: 'Centro',
					lastUpdate: '2025-01-07T00:45:00Z',
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
					fuel: 45
				},
				{
					id: 'VH004',
					name: 'Camión Pesado #4',
					driver: 'Ana López',
					status: 'maintenance',
					location: 'Taller Central',
					lastUpdate: '2025-01-06T18:30:00Z',
					speed: 0,
					fuel: 15
				}
			];
		} finally {
			loadingVehicles = false;
		}
	}

	function getStatusColor(status) {
		switch (status) {
			case 'active': return 'text-green-500';
			case 'inactive': return 'text-gray-500';
			case 'maintenance': return 'text-yellow-500';
			default: return 'text-gray-500';
		}
	}

	function getStatusText(status) {
		switch (status) {
			case 'active': return 'Activo';
			case 'inactive': return 'Inactivo';
			case 'maintenance': return 'Mantenimiento';
			default: return 'Desconocido';
		}
	}
</script>

<svelte:head>
	<title>Dashboard - Tracker Monitor</title>
</svelte:head>


<div class="h-screen w-screen relative overflow-hidden bg-gray-900">
    

    <!-- Navbar lateral -->
    <div class="nav-bar">
		<button 
			on:click={toggleUserPanel}
			aria-label="Abrir panel de información de usuario"
			class="nav-button"
		>
		<!-- Icono de usuario -->
		<svg class="menu-icon" fill="currentColor" viewBox="0 0 20 20">
			<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
		</svg>
		</button>

		<!-- Panel de información de usuario -->
		{#if showUserPanel}
			<div class="menu-card">
				<!-- Información del usuario -->
				<div class="controls">
					<div class="p-3 bg-gray-50/80 rounded-lg">
						<p class="text-sm font-medium text-gray-800 mb-2">Información del Usuario</p>
						{#if userData}
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
									</svg>
									<span class="text-sm text-gray-700">{userData.name}</span>
								</div>
								<div class="flex items-center gap-2">
									<svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clip-rule="evenodd" />
									</svg>
									<span class="text-sm text-gray-700">{userData.email}</span>
								</div>
								<div class="flex items-center gap-2">
									<svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5zM4 8a0 0 0 000 0v6a0 0 0 000 0h12a0 0 0 000 0V8a0 0 0 000 0H4z" clip-rule="evenodd" />
									</svg>
									<span class="text-sm text-gray-700">ID: {userData.id}</span>
								</div>
							</div>
						{:else}
							<p class="text-sm text-gray-500">No hay información de usuario disponible</p>
						{/if}
					</div>
					
					<button class="large-button bg-blue-600 hover:bg-blue-700" on:click={handleLogout}>
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
						</svg>
						Cerrar Sesión
					</button>
				</div>
			</div>
		{/if}

		<hr class="menu-separator"/>
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
                    <button class="large-button bg-green-600 hover:bg-green-700" on:click={toggleVehicleList}>
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
							<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
							<g id="SVGRepo_iconCarrier"> 
								<g id="Edit / Select_Multiple">
									<path id="Vector" d="M3 9V19.4C3 19.9601 3 20.2399 3.10899 20.4538C3.20487 20.642 3.35774 20.7952 3.5459 20.8911C3.7596 21 4.0395 21 4.59846 21H15.0001M17 8L13 12L11 10M7 13.8002V6.2002C7 5.08009 7 4.51962 7.21799 4.0918C7.40973 3.71547 7.71547 3.40973 8.0918 3.21799C8.51962 3 9.08009 3 10.2002 3H17.8002C18.9203 3 19.4801 3 19.9079 3.21799C20.2842 3.40973 20.5905 3.71547 20.7822 4.0918C21.0002 4.51962 21.0002 5.07969 21.0002 6.19978L21.0002 13.7998C21.0002 14.9199 21.0002 15.48 20.7822 15.9078C20.5905 16.2841 20.2842 16.5905 19.9079 16.7822C19.4805 17 18.9215 17 17.8036 17H10.1969C9.07899 17 8.5192 17 8.0918 16.7822C7.71547 16.5905 7.40973 16.2842 7.21799 15.9079C7 15.4801 7 14.9203 7 13.8002Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
								</g>
							</g>
						</svg>
                        {showVehicleList ? 'Ocultar' : 'Ver'} Lista de Vehículos
                    </button>
                    
                    <!-- Lista de vehículos -->
                    {#if showVehicleList}
                        <div class="mt-3 p-3 bg-gray-50/80 rounded-lg max-h-64 overflow-y-auto">
                            <div class="flex justify-between items-center mb-3">
                                <p class="text-sm font-medium text-gray-800">Seleccionar Vehículos</p>
                                <div class="flex gap-2">
                                    <button class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" on:click={selectAllVehicles}>
                                        Todos
                                    </button>
                                    <button class="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600" on:click={clearVehicleSelection}>
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                            
                            {#if loadingVehicles}
                                <div class="flex items-center justify-center py-4">
                                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span class="ml-2 text-sm text-gray-600">Cargando vehículos...</span>
                                </div>
                            {:else if vehicles.length > 0}
                                <div class="space-y-2">
                                    {#each vehicles as vehicle}
                                        <label class="flex items-center gap-3 p-2 rounded hover:bg-gray-100/50 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedVehicles.includes(vehicle.id)}
                                                on:change={() => toggleVehicleSelection(vehicle.id)}
                                                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center justify-between">
                                                    <p class="text-sm font-medium text-gray-900 truncate">{vehicle.name}</p>
                                                    <span class="text-xs px-2 py-1 rounded-full {getStatusColor(vehicle.status)} bg-opacity-20">
                                                        {getStatusText(vehicle.status)}
                                                    </span>
                                                </div>
                                                <p class="text-xs text-gray-500">{vehicle.driver} • {vehicle.location}</p>
                                            </div>
                                        </label>
                                    {/each}
                                </div>
                                
                                {#if selectedVehicles.length > 0}
                                    <div class="mt-3 pt-3 border-t border-gray-200">
                                        <p class="text-xs text-gray-600 mb-2">
                                            {selectedVehicles.length} vehículo{selectedVehicles.length !== 1 ? 's' : ''} seleccionado{selectedVehicles.length !== 1 ? 's' : ''}
                                        </p>
                                        <button class="w-full text-xs px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                            Rastrear Seleccionados
                                        </button>
                                    </div>
                                {/if}
                            {:else}
                                <p class="text-sm text-gray-500 text-center py-4">No hay vehículos disponibles</p>
                            {/if}
                        </div>
                    {/if}
                    
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
                    
                    <button class="large-button bg-red-600 hover:bg-red-700">
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
                        <span class="text-xs text-gray-700">Conectado - {vehicles.filter(v => v.status === 'active').length} vehículos activos</span>
                    </div>
                    {#if selectedVehicles.length > 0}
                        <div class="flex items-center gap-2 mt-1">
                            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span class="text-xs text-gray-700">{selectedVehicles.length} seleccionado{selectedVehicles.length !== 1 ? 's' : ''}</span>
                        </div>
                    {/if}
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
