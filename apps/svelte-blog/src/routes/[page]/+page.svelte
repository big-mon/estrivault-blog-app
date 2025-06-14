<script lang="ts">
  import PostCard from '$components/PostCard/PostCard.svelte';
  import Pagination from '$components/Pagination/Pagination.svelte';
  import { SITE_TITLE } from '$constants';
  import type { PageData } from './$types';

  export let data: PageData;
  const { posts, pagination } = data;
</script>

<svelte:head>
  <title>記事一覧 - ページ{pagination.page} | {SITE_TITLE}</title>
  <meta name="description" content="{SITE_TITLE}の記事一覧ページ{pagination.page}です。技術記事やプログラミング情報を探すことができます。" />
</svelte:head>

<div class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {#each posts as post}
    <PostCard {post} />
  {/each}
</div>

{#if pagination.totalPages > 1}
  <div class="mt-12">
    <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} baseUrl="/" />
  </div>
{/if}
