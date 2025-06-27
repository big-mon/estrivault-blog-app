<script lang="ts">
  import { onMount } from 'svelte';

  // 動的インポートでtransitionモジュールを遅延読み込み
  let fadeTransition:
    | ((node: Element, params?: { duration?: number }) => { duration: number })
    | undefined;
  import('svelte/transition').then((module) => {
    fadeTransition = module.fade;
  });

  export let src: string;
  export let alt: string;
  export let caption: string | null = null;
  export let onClose: () => void;

  let isLoading = true;
  let lightboxElement: HTMLElement;

  function handleImageLoad() {
    isLoading = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  function handleOverlayClick() {
    onClose();
  }

  onMount(() => {
    // スクロールを無効化
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    const originalHtmlOverflow = htmlElement.style.overflowY;
    const originalBodyOverflow = bodyElement.style.overflow;

    htmlElement.style.overflowY = 'hidden';
    bodyElement.style.overflow = 'hidden';

    // フォーカスをライトボックスに移動
    lightboxElement?.focus();

    return () => {
      htmlElement.style.overflowY = originalHtmlOverflow;
      bodyElement.style.overflow = originalBodyOverflow;
    };
  });
</script>

<div
  bind:this={lightboxElement}
  class="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-black/60"
  onclick={handleOverlayClick}
  onkeydown={handleKeydown}
  transition:fadeTransition={{ duration: 200 }}
  role="dialog"
  aria-modal="true"
  aria-labelledby={caption ? 'lightbox-caption' : undefined}
  aria-label={caption || alt}
  tabindex="-1"
>
  <div class="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center p-4">
    <!-- ローディング表示 -->
    {#if isLoading}
      <div class="absolute flex h-64 w-64 items-center justify-center">
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"
          aria-label="画像を読み込み中"
        ></div>
      </div>
    {/if}

    <!-- 画像（常に存在するが、ローディング中は透明） -->
    <img
      {src}
      {alt}
      class="max-h-[80vh] max-w-[80vw] rounded-lg object-contain shadow-2xl transition-opacity duration-200"
      class:opacity-0={isLoading}
      class:opacity-100={!isLoading}
      onload={handleImageLoad}
      draggable="false"
    />

    <!-- キャプション -->
    {#if caption && !isLoading}
      <div
        id="lightbox-caption"
        class="mt-4 max-w-[80vw] text-center text-sm text-white/80"
        transition:fadeTransition={{ delay: 200, duration: 200 }}
      >
        {caption}
      </div>
    {/if}
  </div>
</div>
