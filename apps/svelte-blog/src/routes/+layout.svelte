<script lang="ts">
  import '../app.css';
  import '$lib/styles/syntax-highlight.css';
  import { page } from '$app/state';
  import { onNavigate } from '$app/navigation';
  import Header from '$components/Header/Header.svelte';
  import Footer from '$components/Footer/Footer.svelte';
  import LoadingBar from '$components/LoadingBar/LoadingBar.svelte';

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(() => {
        resolve();
        // navigation.complete を待たずに即アニメーション開始
      });
    });
  });
</script>

<LoadingBar />
<Header pathname={page.url.pathname} />

<main class="mx-auto w-full max-w-6xl px-4 py-4">
  {@render children()}
</main>

<Footer />
