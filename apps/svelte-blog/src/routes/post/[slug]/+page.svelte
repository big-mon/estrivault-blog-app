<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  let post = page.data.post;

  // マウント時にスクロールをトップに戻す
  onMount(() => {
    window.scrollTo(0, 0);
  });
</script>

{#if !post}
  <div class="container mx-auto px-4 py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-800">記事が見つかりません</h1>
      <p class="mt-4 text-gray-600">お探しの記事は存在しないか、削除された可能性があります。</p>
      <a href="/" class="mt-6 inline-block text-blue-600 hover:underline"> トップページに戻る </a>
    </div>
  </div>
{:else}
  <article class="container mx-auto max-w-4xl px-4 py-8">
    <header class="mb-8">
      <h1 class="mb-4 text-4xl font-bold text-gray-900">
        {post.meta.title}
      </h1>

      {#if post.meta.publishedAt}
        <div class="mb-4 text-sm text-gray-500">
          <time datetime={new Date(post.meta.publishedAt).toISOString()}>
            {new Date(post.meta.publishedAt).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      {/if}

      {#if post.meta.tags && post.meta.tags.length > 0}
        <div class="mb-6 flex flex-wrap gap-2">
          {#each post.meta.tags as tag}
            <span class="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {tag}
            </span>
          {/each}
        </div>
      {/if}

      {#if post.meta.coverImage}
        <div class="mb-6 overflow-hidden rounded-lg">
          <img src={post.meta.coverImage} alt={post.meta.title} class="h-auto w-full object-cover" />
        </div>
      {/if}
    </header>

    <div class="prose max-w-none">
      {@html post.html || 'コンテンツがありません'}
    </div>

    <div class="mt-12 border-t border-gray-200 pt-6">
      <a href="/" class="text-blue-600 hover:underline"> &larr; 記事一覧に戻る </a>
    </div>
  </article>
{/if}
