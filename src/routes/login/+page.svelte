<script>
	import { goto } from '$app/navigation';
	import { user, authToken } from '$lib/stores/auth.js';
	import { apiService } from '$lib/services/api.js';
	import { onMount } from 'svelte';

	// Bypass para demo: si VITE_BYPASS_AUTH=true permite entrar con cualquier dato
	const BYPASS = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BYPASS_AUTH === 'true';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	// Redirigir si ya está autenticado (o si BYPASS activa mock desde user.init)
	onMount(() => {
		user.init();
		const unsubscribe = user.subscribe((userData) => {
			if (userData) {
				goto('/dashboard');
			}
		});
		return unsubscribe;
	});

	async function handleLogin() {
		if (!email || !password) {
			error = 'Por favor, completa todos los campos';
			return;
		}

		loading = true;
		error = '';

		try {
			// Si BYPASS está activo, autenticamos mock sin llamar a la API
			if (BYPASS) {
				const demoUser = { id: 1, name: 'Usuario Demo', email };
				authToken.setToken('mock-demo-token');
				user.login(demoUser);
				goto('/dashboard');
				return;
			}
			const response = await apiService.login({ email, password });

			// Guardar token y datos del usuario
			authToken.setToken(response.access_token);
			user.login(response.user);

			// Redirigir al dashboard
			goto('/dashboard');
		} catch (err) {
			error = 'Credenciales inválidas. Por favor, intenta de nuevo.';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Login - Tracker Monitor</title>
</svelte:head>

<!-- Background video -->
<video
	class="fixed inset-0 w-full h-full object-cover pointer-events-none"
	src="/vid/map-back-1.mp4"
	autoplay
	muted
	loop
	playsinline
	aria-hidden="true"
></video>

<!-- Gradient overlay for readability (theme-aware) -->
<div class="fixed inset-0 overlay-layer pointer-events-none"></div>

<!-- Page content -->
<div class="relative z-10 min-h-screen flex items-center justify-center px-4">
	<div class="max-w-md w-full space-y-8 card">
		<div class="text-center">
			<h2 class="section-title">Iniciar Sesión</h2>
			<p class="mt-2 text-sm text-app">Accede a tu cuenta de Tracker Monitor</p>
		</div>

		<form on:submit|preventDefault={handleLogin} class="space-y-6">
			{#if error}
				<div class="alert-error">{error}</div>
			{/if}

			<div>
				<label for="email" class="block text-sm font-medium text-app"
					>Correo electrónico o usuario</label
				>
				<input
					id="email"
					type="text"
					bind:value={email}
					on:keypress={handleKeyPress}
					required
					class="input-field"
					placeholder="test o test@tracker-monitor.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-app">Contraseña</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					on:keypress={handleKeyPress}
					required
					class="input-field"
					placeholder="••••••••"
				/>
			</div>

			<div>
				<button type="submit" disabled={loading} class="btn-primary">
					{#if loading}
						<svg
							class="animate-spin -ml-1 mr-3 h-5 w-5 text-accent"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 
									  5.373 0 12h4zm2 5.291A7.962 7.962 
									  0 014 12H0c0 3.042 1.135 5.824 
									  3 7.938l3-2.647z"
							></path>
						</svg>
						Iniciando sesión...
					{:else}
						Iniciar Sesión
					{/if}
				</button>
			</div>
		</form>

		<div class="mt-6 text-center">
			<p class="text-sm text-app">
				¿No tienes una cuenta?
				<a href="/register" class="font-medium text-accent">Regístrate aquí</a>
			</p>
		</div>
	</div>
</div>
