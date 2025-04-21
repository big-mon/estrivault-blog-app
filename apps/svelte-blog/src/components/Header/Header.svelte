<script lang="ts">
	import Nav from './Nav.svelte';
	import Title from './Title.svelte';
	import Hamburger from '../Icons/Hamburger.svelte';
	import MobileMenu from './MobileMenu.svelte';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();

	let isMenuOpen = $state(false);
</script>

<header class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
	<!-- Desktop menu -->
	<div class="hidden w-full items-center justify-between gap-6 md:flex">
		<Title />
		<Nav {pathname} />
	</div>

	<!-- Mobile menu -->
	<div class="flex w-full items-center justify-between md:hidden">
		<Title />
		<button
			class="text-gray-700 focus:outline-none"
			onclick={() => (isMenuOpen = !isMenuOpen)}
			aria-label="Toggle menu"
		>
			<Hamburger className="h-6 w-6" />
		</button>
	</div>
</header>

<!-- Mobile menu -->
{#if isMenuOpen}
	<MobileMenu {pathname} onClose={() => (isMenuOpen = false)} />
{/if}
