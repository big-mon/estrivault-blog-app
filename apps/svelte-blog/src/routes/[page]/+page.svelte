<script lang="ts">
  import PostCard from '$components/PostCard/PostCard.svelte';
  import Pagination from '$components/Pagination/Pagination.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  const { posts, pagination } = data;
</script>

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