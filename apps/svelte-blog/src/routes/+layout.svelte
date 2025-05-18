<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { onNavigate } from '$app/navigation';
  import Header from '$components/Header/Header.svelte';
  import Footer from '$components/Footer/Footer.svelte';

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<Header pathname={page.url.pathname} />

<main class="mx-auto w-full max-w-6xl px-4 py-8">
  {@render children()}
</main>

<Footer />
