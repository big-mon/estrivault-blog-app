<script lang="ts">
  import type { PostHTML } from '@estrivault/content-processor';
  import amazonCardStyles from './style/amazon-card.module.scss';
  import postStyles from './style/post.module.scss';
  import twitterEmbedStyles from './style/twitter-embed.module.scss';

  export let post: PostHTML;
</script>

<div class="container mx-auto px-2 py-8 sm:px-4">
  <div class="{postStyles.prose} {twitterEmbedStyles.prose} prose max-w-none">
    {@html post.html || 'コンテンツがありません'}
  </div>

  <div class="mt-12 border-t border-gray-200 pt-6">
    <a href="/" class="text-blue-600 hover:underline"> &larr; 記事一覧に戻る </a>
  </div>
</div>
