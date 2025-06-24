<script lang="ts">
  import PostCard from '$components/PostCard/PostCard.svelte';
  import Pagination from '$components/Pagination/Pagination.svelte';
  import { SITE_TITLE, SITE_URL, SITE_AUTHOR, SOCIAL_LINK_X } from '$constants';
  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

  // OGP用のデータを動的生成
  const pageTitle = $derived(
    `${data.tag}の記事一覧${data.pagination.page > 1 ? ` - ページ${data.pagination.page}` : ''} | ${SITE_TITLE}`,
  );
  const pageDescription = $derived(
    `${data.tag}タグが付けられた記事一覧${data.pagination.page > 1 ? `（${data.pagination.page}ページ目）` : ''}です。全${data.pagination.total}件の記事を掲載しています。`,
  );
  const pageUrl = $derived(`${SITE_URL}/tag/${data.tag}/${data.pagination.page}`);
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
  {#if data.pagination.page > 1}
    <link
      rel="prev"
      href={`${SITE_URL}/tag/${data.tag}/${data.pagination.page > 2 ? data.pagination.page - 1 : '1'}`}
    />
  {/if}
  {#if data.pagination.page < data.pagination.totalPages}
    <link rel="next" href={`${SITE_URL}/tag/${data.tag}/${data.pagination.page + 1}`} />
  {/if}
</svelte:head>

<main class="container mx-auto px-4 py-8">
  <div class="mb-8 text-center">
    <h1 class="mb-2 text-3xl font-bold">#{data.tag.toUpperCase()}</h1>
    <p class="text-gray-600">
      全{data.pagination.total}件の記事（{data.pagination.page} / {data.pagination
        .totalPages}ページ）
    </p>
  </div>

  {#if data.posts.length > 0}
    <div class="mb-8">
      <div class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {#each data.posts as post (post.slug)}
          <PostCard {post} />
        {/each}
      </div>

      {#if data.pagination.totalPages > 1}
        <div class="mt-12">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            baseUrl={`/tag/${data.tag}`}
            maxVisible={5}
          />
        </div>
      {/if}
    </div>
  {:else}
    <div class="rounded-lg bg-gray-50 p-8 text-center">
      <p class="text-gray-500">このタグにはまだ記事がありません。</p>
    </div>
  {/if}
</main>
