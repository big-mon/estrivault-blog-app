<script lang="ts">
  import type { PostMeta } from '@estrivault/content-processor';

  export let meta: PostMeta;
</script>

<header class="mb-12">
  <div class="container mx-auto">
    <div class="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
      <!-- 画像を左側に配置（モバイルでは上部） -->
      {#if meta.coverImage}
        <div class="w-full lg:w-1/2">
          <div class="overflow-hidden rounded-lg shadow-lg">
            <img
              src={meta.coverImage}
              alt={meta.title}
              class="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      {/if}

      <!-- テキストコンテンツを右側に配置（モバイルでは下部） -->
      <div class="w-full lg:w-1/2">
        <!-- カテゴリタグ -->
        {#if meta.category}
          <span
            class="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700"
          >
            {meta.category}
          </span>
        {/if}

        <!-- タイトル -->
        <h1 class="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {meta.title}
        </h1>

        <!-- 公開日 -->
        {#if meta.publishedAt}
          <div class="mb-4 flex items-center text-sm text-gray-500">
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <time datetime={new Date(meta.publishedAt).toISOString()}>
              {new Date(meta.publishedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {meta.updatedAt ? '（更新）' : ''}
            </time>
          </div>
        {/if}

        <!-- タグ -->
        {#if meta.tags && meta.tags.length > 0}
          <div class="mb-6 flex flex-wrap gap-2">
            {#each meta.tags as tag}
              <span
                class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                {tag}
              </span>
            {/each}
          </div>
        {/if}

        <!-- リード文（もしあれば） -->
        {#if meta.description}
          <p class="text-lg leading-relaxed text-gray-600">
            {meta.description}
          </p>
        {/if}
      </div>
    </div>
  </div>
</header>
