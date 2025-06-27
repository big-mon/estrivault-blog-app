<script lang="ts">
  import { beforeNavigate, afterNavigate } from '$app/navigation';

  let { class: className = '' } = $props();
  let isNavigating = $state(false);

  // Register navigation callbacks once using SvelteKit's built-in cleanup
  beforeNavigate(() => {
    isNavigating = true;
  });

  afterNavigate(() => {
    isNavigating = false;
  });
</script>

{#if isNavigating}
  <div
    class="fixed left-0 right-0 top-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm {className}"
    style="animation: loading-bar 2s infinite linear;"
  ></div>
{/if}

<style>
  @keyframes loading-bar {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>
