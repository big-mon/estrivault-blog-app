<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import Header from '$components/Post/Header.svelte';
  import Post from '$components/Post/Post.svelte';

  const post = page.data.post;

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
  <Header meta={post.meta} />
  <Post {post} />
{/if}
