<script lang="ts">
	import '../app.css';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { page } from '$app/stores';
	import Header from '$components/Header/Header.svelte';
	import Footer from '$components/Footer/Footer.svelte';

	let { children } = $props();
	
	// 現在のパスを取得
	let currentPath = $derived($page.url.pathname);
</script>

<svelte:head>
	<style>
		:global(html) {
			scroll-behavior: smooth;
		}

		.page-transition {
			animation: fadeIn 0.3s ease-in-out;
		}

		@keyframes fadeIn {
			from {
				opacity: 0;
				transform: translateY(10px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
	</style>
</svelte:head>

<Header pathname={currentPath} />

<main
	class="page-transition mx-auto w-full max-w-6xl px-4 py-8"
	in:fly={{ y: 20, duration: 300, easing: quintOut }}
	out:fade={{ duration: 200 }}
>
	{@render children()}
</main>

<Footer />
