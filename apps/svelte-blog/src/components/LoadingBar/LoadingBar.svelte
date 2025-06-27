<script lang="ts">
  // 動的インポートでナビゲーションモジュールを遅延読み込み
  let beforeNavigate: ((fn: () => void) => void) | undefined;
  let afterNavigate: ((fn: () => void) => void) | undefined;

  import('$app/navigation').then((module) => {
    beforeNavigate = module.beforeNavigate;
    afterNavigate = module.afterNavigate;
  });

  let { class: className = '' } = $props();
  let isNavigating = $state(false);

  $effect(() => {
    if (beforeNavigate && afterNavigate) {
      beforeNavigate(() => {
        isNavigating = true;
      });

      afterNavigate(() => {
        isNavigating = false;
      });
    }
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
