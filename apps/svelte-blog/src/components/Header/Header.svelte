<script lang="ts">
	import Nav from './Nav.svelte';
	import Title from './Title.svelte';

	interface Props {
		pathname: string;
	}

	const { pathname }: Props = $props();
</script>

<header>
	<Title />
	<div><Nav {pathname} /></div>
	{pathname}
</header>
