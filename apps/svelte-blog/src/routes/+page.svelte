<script lang="ts">
  import PostCard from '$components/PostCard/PostCard.svelte';
  import Pagination from '$components/Pagination/Pagination.svelte';
  import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL, SITE_AUTHOR, SOCIAL_LINK_X } from '$constants';
  import type { PageData } from './$types';

  export let data: PageData;
  const { posts, pagination } = data;
</script>

<svelte:head>
  <title>{SITE_TITLE}</title>
  <meta name="description" content={SITE_DESCRIPTION} />
  <meta name="author" content={SITE_AUTHOR} />

  <!-- Open Graph -->
  <meta property="og:title" content={SITE_TITLE} />
  <meta property="og:description" content={SITE_DESCRIPTION} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={SITE_URL} />
  <meta property="og:site_name" content={SITE_TITLE} />
  <meta property="og:locale" content="ja_JP" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:creator" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:title" content={SITE_TITLE} />
  <meta name="twitter:description" content={SITE_DESCRIPTION} />

  <!-- Canonical URL -->
  <link rel="canonical" href={SITE_URL} />
</svelte:head>

<div class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {#each posts as post (post.slug)}
    <PostCard {post} />
  {/each}
</div>

{#if pagination.totalPages > 1}
  <div class="mt-12">
    <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} baseUrl="/" />
  </div>
{/if}
