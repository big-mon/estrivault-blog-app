<script lang="ts">
	import GitHub from '../Icons/GitHub.svelte';
	import X from '../Icons/X.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="flex flex-col items-center gap-2 py-6 text-sm text-gray-500">
	<div class="flex gap-6">
		<X className="h-6 w-6 transition-opacity hover:opacity-80" />

		<GitHub className="h-6 w-6 transition-opacity hover:opacity-80" />
	</div>
	<p>© {year} Estrivault. All rights reserved.</p>
</footer>
