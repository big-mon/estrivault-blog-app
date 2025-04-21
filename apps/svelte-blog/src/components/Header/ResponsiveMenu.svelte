<script lang="ts">
	import Nav from './Nav.svelte';
	import Hamburger from '../Icons/Hamburger.svelte';
	import MobileMenu from './MobileMenu.svelte';

	interface Props {
		pathname: string;
	}
	const { pathname }: Props = $props();

	let isMenuOpen = $state(false);
</script>

<!-- Desktop Menu -->
<div class="hidden items-center gap-6 md:flex">
	<Nav {pathname} />
</div>

<!-- Mobile Menu -->
<div class="md:hidden">
	<button class="text-gray-700" onclick={() => (isMenuOpen = !isMenuOpen)} aria-label="Toggle menu">
		<Hamburger className="h-6 w-6" />
	</button>

	{#if isMenuOpen}
		<MobileMenu {pathname} onClose={() => (isMenuOpen = false)} />
	{/if}
</div>
