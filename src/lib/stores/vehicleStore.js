import { writable, derived } from 'svelte/store';

// Módulo deshabilitado temporalmente: exports mínimos y no-op
export const vehicles = writable([]);
export const selectedVehicles = writable([]);
export const loadingVehicles = writable(false);
export const vehiclePositions = writable(new Map());
export const loadingPositions = writable(false);

export const activeVehicles = derived(vehicles, ($v) => $v);
export const selectedVehicleCount = derived(selectedVehicles, ($s) => $s.length);

export const vehicleActions = {
  async loadVehicles() {},
  async updateVehiclePosition() { return null; },
  toggleVehicleSelection() {},
  selectAllVehicles() {},
  clearSelection() { selectedVehicles.set([]); },
  getVehicleById() { return null; }
};
