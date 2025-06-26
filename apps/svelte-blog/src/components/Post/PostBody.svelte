<script lang="ts">
  import type { PostHTML } from '@estrivault/content-processor';
  import amazonCardStyles from './style/amazon-card.module.scss';
  import postStyles from './style/post.module.scss';
  import twitterEmbedStyles from './style/twitter-embed.module.scss';
  import syntaxHighlightStyles from './style/syntax-highlight.module.scss';
  import ImageLightbox from '../ImageLightbox.svelte';
  import { onMount } from 'svelte';

  export let post: PostHTML;

  let lightboxImage: { src: string; alt: string; caption: string | null } | null = null;
  let postContainer: HTMLDivElement;

  // コードブロックがある場合のみシンタックスハイライトスタイルを適用
  // Twitterの埋め込みがある場合のみTwitterスタイルを適用
  // Amazonの埋め込みがある場合のみAmazonスタイルを適用
  $: proseClasses = [
    postStyles.prose,
    post.hasTwitterEmbeds ? twitterEmbedStyles.prose : '',
    post.hasAmazonEmbeds ? amazonCardStyles.prose : '',
    post.hasCodeBlocks ? syntaxHighlightStyles.prose : '',
    'prose max-w-none',
  ]
    .filter(Boolean)
    .join(' ');

  function handleImageClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const figure = img.closest('figure');
      const figcaption = figure?.querySelector('figcaption');

      lightboxImage = {
        src: img.src,
        alt: img.alt || '',
        caption: figcaption?.textContent || null,
      };
    }
  }

  function closeLightbox() {
    lightboxImage = null;
  }

  onMount(() => {
    if (postContainer) {
      postContainer.addEventListener('click', handleImageClick);
      return () => {
        postContainer.removeEventListener('click', handleImageClick);
      };
    }
    return () => {};
  });
</script>

<div class="container mx-auto px-2 py-8 sm:px-4" bind:this={postContainer}>
  <div class={proseClasses}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html post.html || 'コンテンツがありません'}
  </div>

  <div class="mt-12 border-t border-gray-200 pt-6">
    <a href="/" class="text-blue-600 hover:underline"> &larr; 記事一覧に戻る </a>
  </div>
</div>

<!-- ライトボックス -->
{#if lightboxImage}
  <ImageLightbox
    src={lightboxImage.src}
    alt={lightboxImage.alt}
    caption={lightboxImage.caption}
    onClose={closeLightbox}
  />
{/if}
