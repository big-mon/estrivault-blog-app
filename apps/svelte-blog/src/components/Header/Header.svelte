<script lang="ts">
	import Nav from './Nav.svelte';
	import Title from './Title.svelte';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();
</script>

<header class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
	<Title />
	<div><Nav {pathname} /></div>
</header>
