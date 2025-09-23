<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth.js';
	import UserPanel from '$lib/components/UserPanel.svelte';
	import VehiclePanel from '$lib/components/VehiclePanel.svelte';
	import MapContainer from '$lib/components/MapContainer.svelte';

	let isLoading = true;
	let userData = null;
	let showVehiclePanel = false;
	let showUserPanel = false;
	let showVehicleList = false;

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

		return () => {
			unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Dashboard - Tracker Monitor</title>
</svelte:head>

<div class="h-screen w-screen relative overflow-hidden bg-gray-900">
	<!-- Navbar lateral -->
	<div class="nav-bar">
		<UserPanel bind:showUserPanel {userData} />

		<hr class="menu-separator" />

		<VehiclePanel bind:showVehiclePanel bind:showVehicleList />
	</div>

	<!-- Contenedor del mapa -->
	<MapContainer bind:isLoading />
</div>
