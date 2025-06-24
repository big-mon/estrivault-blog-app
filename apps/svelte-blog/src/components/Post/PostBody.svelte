<script lang="ts">
  import type { PostHTML } from '@estrivault/content-processor';
  import amazonCardStyles from './style/amazon-card.module.scss';
  import postStyles from './style/post.module.scss';
  import twitterEmbedStyles from './style/twitter-embed.module.scss';
  import syntaxHighlightStyles from './style/syntax-highlight.module.scss';

  export let post: PostHTML;

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
</script>

<div class="container mx-auto px-2 py-8 sm:px-4">
  <div class={proseClasses}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html post.html || 'コンテンツがありません'}
  </div>

  <div class="mt-12 border-t border-gray-200 pt-6">
    <a href="/" class="text-blue-600 hover:underline"> &larr; 記事一覧に戻る </a>
  </div>
</div>
