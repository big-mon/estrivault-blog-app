<script lang="ts">
	import Title from './Title.svelte';
	import ResponsiveMenu from './ResponsiveMenu.svelte';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();
</script>

<header class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
	<Title />
	<ResponsiveMenu {pathname} />
</header>
