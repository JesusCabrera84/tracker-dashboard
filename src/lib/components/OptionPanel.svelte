<script>
	import { goto } from '$app/navigation';
	import { user, authToken } from '$lib/stores/auth.js';
	import { theme } from '$lib/stores/theme.js';

	export let showOptionPanel = false;
	export let toggleOptionPanel = null;

	function setModern() {
		theme.set('modern');
	}
	function setClassic() {
		theme.set('classic');
	}

	function setDark() {
		theme.set('dark');
	}
</script>

<button
	on:click={toggleOptionPanel || (() => (showOptionPanel = !showOptionPanel))}
	aria-label="Abrir panel de configuraci&oacute;n"
	class="nav-button"
>
	<!-- Icono de opciones -->
    <svg class="menu-icon" viewBox="0 0 32 32">
        <path d="M23.265,24.381l.9-.894c4.164.136,4.228-.01,4.411-.438l1.144-2.785L29.805,20l-.093-.231c-.049-.122-.2-.486-2.8-2.965V15.5c3-2.89,2.936-3.038,2.765-3.461L28.538,9.225c-.171-.422-.236-.587-4.37-.474l-.9-.93a20.166,20.166,0,0,0-.141-4.106l-.116-.263-2.974-1.3c-.438-.2-.592-.272-3.4,2.786l-1.262-.019c-2.891-3.086-3.028-3.03-3.461-2.855L9.149,3.182c-.433.175-.586.237-.418,4.437l-.893.89c-4.162-.136-4.226.012-4.407.438L2.285,11.733,2.195,12l.094.232c.049.12.194.48,2.8,2.962l0,1.3c-3,2.89-2.935,3.038-2.763,3.462l1.138,2.817c.174.431.236.584,4.369.476l.9.935a20.243,20.243,0,0,0,.137,4.1l.116.265,2.993,1.308c.435.182.586.247,3.386-2.8l1.262.016c2.895,3.09,3.043,3.03,3.466,2.859l2.759-1.115C23.288,28.644,23.44,28.583,23.265,24.381ZM11.407,17.857a4.957,4.957,0,1,1,6.488,2.824A5.014,5.014,0,0,1,11.407,17.857Z" ></path>
    </svg>
</button>

<!-- Panel de configuracion -->
{#if showOptionPanel}
	<div class="menu-card">
		<!-- Información del usuario -->
		<div class="controls">
			<div class="p-3 rounded-lg">
				<p class="text-sm font-medium mb-2 text-app">Configuraciiones</p>
				

                <!-- Cambiar tema -->
                <div class="p-3 rounded-lg ">
                    <p class="text-sm font-medium mb-2 text-app">Tema</p>
                    <div class="flex gap-2">
                        <button class="btn-primary px-3 py-1 w-auto" on:click={setModern}>
                            Moderno
                        </button>
                        <button class="btn-secondary" on:click={setClassic}>
                            Clásico
                        </button>
                        <button class="btn-secondary" on:click={setDark}>
                            Dark
                        </button>
                    </div>
                </div>

						
					
			</div>

			
		</div>
	</div>
{/if}
