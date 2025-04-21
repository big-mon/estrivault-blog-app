<script lang="ts">
	import Title from './Title.svelte';
	import ResponsiveMenu from './ResponsiveMenu.svelte';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();
</script>

<header class="w-full border-b border-gray-200 bg-white">
	<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
		<Title />
		<ResponsiveMenu {pathname} />
	</div>
</header>
