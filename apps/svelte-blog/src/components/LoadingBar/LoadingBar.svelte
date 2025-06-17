<script lang="ts">
  import { beforeNavigate, afterNavigate } from '$app/navigation';

  let { class: className = '' } = $props();
  let isNavigating = $state(false);

  beforeNavigate(() => {
    isNavigating = true;
  });

  afterNavigate(() => {
    isNavigating = false;
  });
</script>

{#if isNavigating}
  <div
    class="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm {className}"
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
