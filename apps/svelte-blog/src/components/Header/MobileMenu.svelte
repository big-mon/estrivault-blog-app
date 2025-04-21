<script lang="ts">
	import Nav from './Nav.svelte';

	export let pathname: string;
	export let onClose: () => void;
</script>

<div class="fixed inset-0 z-50 bg-white p-6 md:hidden">
	<div class="mb-4 flex justify-end">
		<button class="text-gray-700" onclick={onClose} aria-label="Close menu"> ✕ </button>
	</div>
	<Nav {pathname} />
</div>
