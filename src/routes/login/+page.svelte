<script>
	import { goto } from '$app/navigation';
	import { user, authToken } from '$lib/stores/auth.js';
	import { apiService } from '$lib/services/api.js';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	// Redirigir si ya está autenticado
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


<div class="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center px-4">
	<div class="max-w-md w-full space-y-8">
	  <div class="text-center">
		<h2 class="section-title">Iniciar Sesión</h2>
		<p class="mt-2 text-sm text-blue-200">Accede a tu cuenta de Tracker Monitor</p>
	  </div>
  
	  <div class="card">
		<form on:submit|preventDefault={handleLogin} class="space-y-6">
		  {#if error}
			<div class="alert-error">{error}</div>
		  {/if}
  
		  <div>
			<label for="email" class="block text-sm font-medium text-gray-300">Correo Electrónico</label>
			<input id="email" type="email" bind:value={email} on:keypress={handleKeyPress} required
			  class="input-field" placeholder="tu@email.com" />
		  </div>
  
		  <div>
			<label for="password" class="block text-sm font-medium text-gray-300">Contraseña</label>
			<input id="password" type="password" bind:value={password} on:keypress={handleKeyPress} required
			  class="input-field" placeholder="••••••••" />
		  </div>
  
		  <div>
			<button type="submit" disabled={loading} class="btn-primary">
			  {#if loading}
				<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
				  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				  <circle class="opacity-25" cx="12" cy="12" r="10"
					stroke="currentColor" stroke-width="4"></circle>
				  <path class="opacity-75" fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 
					  5.373 0 12h4zm2 5.291A7.962 7.962 
					  0 014 12H0c0 3.042 1.135 5.824 
					  3 7.938l3-2.647z"></path>
				</svg>
				Iniciando sesión...
			  {:else}
				Iniciar Sesión
			  {/if}
			</button>
		  </div>
		</form>
  
		<div class="mt-6 text-center">
		  <p class="text-sm text-gray-400">
			¿No tienes una cuenta?
			<a href="/register" class="font-medium text-blue-400 hover:text-blue-300">Regístrate aquí</a>
		  </p>
		</div>
	  </div>
	</div>
  </div>
  
