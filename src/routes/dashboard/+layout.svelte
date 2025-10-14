<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth.js';
	import '$lib//styles/dashboard.css';

	// Permitir saltar autenticación si VITE_BYPASS_AUTH=true
	const BYPASS = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BYPASS_AUTH === 'true';

	let { children } = $props();
	let isAuthenticated = $state(false);
	let isLoading = $state(true);

	onMount(() => {
		user.init();

		const unsubscribe = user.subscribe((userData) => {
			isAuthenticated = !!userData;
			isLoading = false;

			if (!userData && !BYPASS) {
				goto('/login');
			}
		});

		return unsubscribe;
	});
</script>


{#if isLoading}
	<div class="min-h-screen flex items-center justify-center bg-app">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style="border-color: var(--accent-cyan)"></div>
			<p class="text-app">Verificando autenticación...</p>
		</div>
	</div>
{:else if isAuthenticated}
	{@render children?.()}
{/if}
