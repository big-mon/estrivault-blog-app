<script lang="ts">
	import '../app.css';
	import Header from '../components/Header/Header.svelte';
	import Footer from '../components/Footer/Footer.svelte';
	import { getStores } from '$app/stores';
	const { page } = getStores();

	let { children } = $props();
</script>

<Header pathname={$page.url.pathname} />

<div class="">
	<main>{@render children()}</main>
</div>

<Footer />
