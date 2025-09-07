<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { user, authToken } from '$lib/stores/auth.js';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Inicializar stores de autenticación
		user.init();
		authToken.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
