<script>
	import { onMount } from 'svelte';
	import { mapService } from '$lib/services/mapService.js';
	import { vehicles, vehicleActions } from '$lib/stores/vehicleStore.js';

	export let isLoading = true;

	let mapElement;
	let map;

	onMount(async () => {
		try {
			map = await mapService.initialize(mapElement);
			isLoading = false;

			// Suscribirse a cambios en vehículos para actualizar marcadores
			const unsubscribe = vehicles.subscribe((vehicleList) => {
				if (vehicleList.length > 0) {
					// Limpiar marcadores existentes (excepto ubicación del usuario)
					mapService.markers.forEach((markerData, key) => {
						if (key !== 'user-location') {
							markerData.marker.setMap(null);
							mapService.markers.delete(key);
						}
					});

					// Agregar nuevos marcadores
					mapService.addVehicleMarkers(vehicleList);

					// Centrar en vehículos con coordenadas válidas
					const vehiclesWithCoords = vehicleList.filter(
						(v) => (v.latitude || v.lat) && (v.longitude || v.lng)
					);

					if (vehiclesWithCoords.length > 0) {
						mapService.centerOnVehicles(vehiclesWithCoords);
					}
				}
			});

			return () => {
				unsubscribe();
			};
		} catch (error) {
			console.error('Error inicializando mapa:', error);
			isLoading = false;
		}
	});
</script>

<!-- Contenedor del mapa -->
<div class="map-wrap">
	{#if isLoading}
		<div class="flex items-center justify-center h-full loading-overlay">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style="border-color: var(--accent-cyan)"></div>
				<p class="font-medium text-app">Cargando mapa...</p>
			</div>
		</div>
	{/if}

	<div bind:this={mapElement} class="map-canvas"></div>
	<div class="vignette pointer-events-none"></div>
</div>
