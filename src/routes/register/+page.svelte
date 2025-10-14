<script>
	import { goto } from '$app/navigation';
	import { user, authToken } from '$lib/stores/auth.js';
	import { apiService } from '$lib/services/api.js';
	import { onMount } from 'svelte';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
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

	async function handleRegister() {
		if (!name || !email || !password || !confirmPassword) {
			error = 'Por favor, completa todos los campos';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Las contraseñas no coinciden';
			return;
		}

		if (password.length < 6) {
			error = 'La contraseña debe tener al menos 6 caracteres';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await apiService.register({
				name,
				email,
				password
			});

			// Guardar token y datos del usuario
			authToken.setToken(response.access_token);
			user.login(response.user);

			// Redirigir al dashboard
			goto('/dashboard');
		} catch (err) {
			error = 'Error al crear la cuenta. Por favor, intenta de nuevo.';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleRegister();
		}
	}
</script>

<svelte:head>
	<title>Registro - Tracker Monitor</title>
</svelte:head>

<div class="min-h-screen bg-app flex items-center justify-center px-4">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h2 class="mt-6 text-3xl font-extrabold text-app">Crear Cuenta</h2>
			<p class="mt-2 text-sm text-app">Únete a Tracker Monitor</p>
		</div>

		<div class="panel rounded-lg shadow-xl p-8">
			<form on:submit|preventDefault={handleRegister} class="space-y-6">
				{#if error}
					<div class="alert-error">
						{error}
					</div>
				{/if}

				<div>
					<label for="name" class="block text-sm font-medium text-app">
						Nombre Completo
					</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						on:keypress={handleKeyPress}
						required
						class="input-field"
						placeholder="Tu nombre completo"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-app">
						Correo Electrónico
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						on:keypress={handleKeyPress}
						required
						class="input-field"
						placeholder="tu@email.com"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-app"> Contraseña </label>
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
					<label for="confirmPassword" class="block text-sm font-medium text-app">
						Confirmar Contraseña
					</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
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
								class="animate-spin -ml-1 mr-3 h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="var(--accent-cyan)"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="var(--accent-cyan)"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Creando cuenta...
						{:else}
							Crear Cuenta
						{/if}
					</button>
				</div>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-app">
					¿Ya tienes una cuenta?
					<a href="/login" class="font-medium text-accent">
						Inicia sesión aquí
					</a>
				</p>
			</div>
		</div>
	</div>
</div>
