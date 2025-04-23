<script lang="ts">
	import Title from './Title.svelte';
	import ResponsiveMenu from './ResponsiveMenu.svelte';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();
</script>

<div class="py-4">
	<header
		class="mx-auto w-full max-w-6xl rounded-xl bg-white/70
         px-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-white/60
         sm:px-6 lg:px-8"
	>
		<div class="flex items-center justify-between py-2">
			<Title />
			<ResponsiveMenu {pathname} />
		</div>
	</header>
</div>
