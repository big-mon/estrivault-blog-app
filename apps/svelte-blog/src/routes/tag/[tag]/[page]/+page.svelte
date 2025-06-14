<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import PostCard from '$components/PostCard/PostCard.svelte';
  import Pagination from '$components/Pagination/Pagination.svelte';
  import { SITE_TITLE } from '$constants';
  import type { PageData } from '../../../$types';
  import type { PostMeta } from '@estrivault/content-processor';

  const { data } = $props<{ data: PageData }>();

  type PageDataType = {
    posts: PostMeta[];
    tag: string;
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
  };

  const pageData = $state<PageDataType>({
    posts: [],
    tag: '',
    pagination: {
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 1,
    },
  });

  // データを更新する共通関数
  const updateData = () => {
    const newData = data as unknown as PageDataType;
    pageData.posts = newData.posts;
    pageData.tag = newData.tag;
    pageData.pagination = newData.pagination;
  };

  // 初期データを設定
  $effect(() => {
    if (browser) {
      updateData();
    }
  });

  // ナビゲーション後にデータを更新
  if (browser) {
    afterNavigate(({ to }) => {
      if (to?.url.pathname.includes('/tag/')) {
        updateData();
      }
    });
  }
</script>

<svelte:head>
  <title>{pageData.tag}の記事一覧 | {SITE_TITLE}</title>
  <meta name="description" content="{pageData.tag.toUpperCase()}タグの記事一覧ページです。" />
</svelte:head>

<main class="container mx-auto px-4 py-8">
  <div class="mb-8 text-center">
    <h1 class="mb-2 text-3xl font-bold">#{pageData.tag.toUpperCase()}</h1>
    <p class="text-gray-600">
      全{pageData.pagination.total}件の記事（{pageData.pagination.page} / {pageData.pagination
        .totalPages}ページ）
    </p>
  </div>

  {#if pageData.posts.length > 0}
    <div class="mb-8">
      <div class="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {#each pageData.posts as post}
          <PostCard {post} />
        {/each}
      </div>

      {#if pageData.pagination.totalPages > 1}
        <div class="mt-12">
          <Pagination
            currentPage={pageData.pagination.page}
            totalPages={pageData.pagination.totalPages}
            baseUrl={`/tag/${pageData.tag}`}
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
