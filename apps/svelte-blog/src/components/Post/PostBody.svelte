<script lang="ts">
  import type { PostHTML } from '@estrivault/content-processor';

  export let post: PostHTML;
</script>

<article class="container mx-auto max-w-4xl px-4 py-8">
  <div class="prose max-w-none">
    {@html post.html || 'コンテンツがありません'}
  </div>

  <div class="mt-12 border-t border-gray-200 pt-6">
    <a href="/" class="text-blue-600 hover:underline"> &larr; 記事一覧に戻る </a>
  </div>
</article>
