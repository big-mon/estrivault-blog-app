<script lang="ts">
  import PostCard from '$components/PostCard/PostCard.svelte';
  import Pagination from '$components/Pagination/Pagination.svelte';
  import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL, SITE_AUTHOR, SOCIAL_LINK_X } from '$constants';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();
  const { posts, pagination } = data;
  
  const pageTitle = $derived(`記事一覧 - ページ${pagination.page} | ${SITE_TITLE}`);
  const pageDescription = $derived(`${SITE_TITLE}の記事一覧ページ${pagination.page}です。技術記事やプログラミング情報を探すことができます。`);
  const pageUrl = $derived(`${SITE_URL}${pagination.page > 1 ? `/${pagination.page}` : ''}`);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta name="author" content={SITE_AUTHOR} />
  
  <!-- Open Graph -->
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:site_name" content={SITE_TITLE} />
  <meta property="og:locale" content="ja_JP" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:creator" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  
  <!-- Canonical URL -->
  <link rel="canonical" href={pageUrl} />
  
  <!-- Pagination meta -->
  {#if pagination.page > 1}
    <link rel="prev" href={`${SITE_URL}${pagination.page > 2 ? `/${pagination.page - 1}` : ''}`} />
  {/if}
  {#if pagination.page < pagination.totalPages}
    <link rel="next" href={`${SITE_URL}/${pagination.page + 1}`} />
  {/if}
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
