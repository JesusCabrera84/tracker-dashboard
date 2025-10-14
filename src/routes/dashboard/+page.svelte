<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import { vehicleActions, loadingVehicles, loadingPositions, vehicles } from '$lib/stores/vehicleStore.js';
  import { apiService } from '$lib/services/api.js';
  import { positionService } from '$lib/services/positionService.js';
  import { mapService } from '$lib/services/mapService.js';
  import { fade } from 'svelte/transition';
  import UserPanel from '$lib/components/UserPanel.svelte';
  import VehiclePanel from '$lib/components/VehiclePanel.svelte';
  import MapContainer from '$lib/components/MapContainer.svelte';

  let isLoading = true;
  let userData = null;
  let showVehiclePanel = false;
  let showUserPanel = false;
  let showVehicleList = false;
  let showToast = false;
  let toastTimeout;

  $: {
    if ($loadingVehicles || $loadingPositions) {
      showToast = true;
      if (toastTimeout) clearTimeout(toastTimeout);
    } else {
      if (showToast) {
        toastTimeout = setTimeout(() => (showToast = false), 600);
      }
    }
  }

  let loadedOnce = false;

  function normalizeCommToVehicle(c) {
    const deviceId = c?.device_id || c?.deviceId || c?.device?.id || c?.id || 'unknown';
    const lat = c?.latitude ?? c?.lat ?? c?.coordinates?.lat ?? c?.position?.lat;
    const lng = c?.longitude ?? c?.lng ?? c?.coordinates?.lng ?? c?.position?.lng;
    const ts = c?.timestamp || c?.time || c?.created_at || c?.lastUpdate;

    return {
      id: deviceId,
      name: deviceId,
      deviceId,
      latitude: lat,
      longitude: lng,
      status: 'active',
      lastUpdateFormatted: ts || 'No disponible'
    };
  }

  async function waitForMapReady(maxAttempts = 20, delayMs = 150) {
    let attempts = 0;
    while (!mapService?.map && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, delayMs));
      attempts++;
    }
    return !!mapService?.map;
  }

  async function loadDevicesAndCommunications(currentUser) {
    try {
      // Obtener devices del usuario
      const resp = await apiService.getDevices(currentUser);
      const deviceList = resp?.devices || [];

      // Mapear devices a vehículos mínimos
      const mapped = deviceList.map((d) => ({
        id: d.id,
        name: d.id,
        deviceId: d.id,
        status: 'active'
      }));
      vehicles.set(mapped);

      // Consultar últimas comunicaciones para estos device_ids
      const ids = deviceList.map((d) => d.id);
      console.warn('IDs de dispositivos:', ids);
      if (ids.length > 0) {
        try {
          const comm = await positionService.getLatestCommunications(ids);
          console.warn('Comunicaciones (page load):', comm);
          // Asegurar que el mapa esté listo antes de pintar
          await waitForMapReady();
          const items = Array.isArray(comm) ? comm : (comm?.communications || []);
          items.forEach((c) => {
            //const v = normalizeCommToVehicle(c);
			const v = c;
            if (v.latitude != null && v.longitude != null) {
              mapService.updateVehicleMarker(v);
            }
          });
        } catch (e2) {
          console.warn('No se pudieron obtener las comunicaciones en page load:', e2);
        }
      }
    } catch (e) {
      console.error('Error cargando devices en page load:', e);
    }
  }

  onMount(async () => {
    await user.init();
    const unsubscribe = user.subscribe((data) => {
      userData = data;
      if (!data) {
        goto('/login');
        return;
      }
    });
    loadDevicesAndCommunications(userData);
  });
</script>

<div class="h-screen w-screen relative overflow-hidden bg-gray-900">
  <div class="nav-bar">
    <UserPanel bind:showUserPanel {userData} />

    <VehiclePanel bind:showVehiclePanel bind:showVehicleList />
  </div>

  <!-- Contenedor del mapa -->
  <MapContainer bind:isLoading />

  {#if showToast}
    <div class="fixed bottom-4 right-4 z-50" transition:fade={{ duration: 200 }}>
      <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-gray-900/90 text-white border border-gray-700">
        <svg class="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium">{$loadingVehicles || $loadingPositions ? ($loadingVehicles ? 'Cargando vehículos…' : 'Actualizando posiciones…') : 'Listo'}</span>
      </div>
    </div>
  {/if}
</div>
