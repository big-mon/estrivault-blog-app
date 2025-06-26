<script lang="ts">
  import { scale, fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  export let src: string;
  export let alt: string;
  export let caption: string | null = null;
  export let onClose: () => void;

  let imageElement: HTMLImageElement;
  let isLoading = true;

  function handleImageLoad() {
    isLoading = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  onMount(() => {
    // htmlとbodyの両方でスクロールを無効化
    const originalHtmlOverflow = document.documentElement.style.overflowY;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflowY = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  });
</script>

<!-- オーバーレイ（背景タップで閉じる） -->
<div
  class="fixed inset-0 flex cursor-zoom-out items-center justify-center bg-black/80"
  style="z-index: 9999;"
  onclick={onClose}
  onkeydown={handleKeydown}
  transition:fade={{ duration: 200 }}
  role="dialog"
  aria-modal="true"
  aria-labelledby="lightbox-title"
  tabindex="-1"
>
  <!-- 画像コンテナ -->
  <div class="relative max-h-[90vh] max-w-[90vw] p-4" role="presentation">
    <!-- ローディング表示 -->
    {#if isLoading}
      <div class="flex h-64 w-64 items-center justify-center">
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"
        ></div>
      </div>
    {/if}

    <!-- 画像 -->
    <img
      bind:this={imageElement}
      {src}
      {alt}
      class="h-auto max-h-[80vh] w-auto max-w-[80vw] rounded-lg object-contain shadow-2xl"
      class:opacity-0={isLoading}
      class:opacity-100={!isLoading}
      transition:scale={{ duration: 300, start: 0.8 }}
      onload={handleImageLoad}
      id="lightbox-title"
    />

    <!-- キャプション -->
    {#if caption && !isLoading}
      <div
        class="mt-4 text-center text-sm text-white/80"
        transition:fade={{ delay: 200, duration: 200 }}
      >
        {caption}
      </div>
    {/if}
  </div>
</div>
