<script lang="ts">
  import type { PostMeta } from '@estrivault/content-processor';

  export let meta: PostMeta;
</script>

<header class="bg-white pb-12 pt-8">
  <div class="container mx-auto px-4">
    <div class="flex flex-col items-start gap-8 lg:flex-row lg:items-stretch">
      <!-- 画像を左側に配置 -->
      {#if meta.coverImage}
        <div class="mb-8 w-full lg:mb-0 lg:flex lg:w-1/2 lg:items-center">
          <div class="w-full overflow-hidden rounded-lg border border-gray-200">
            <img src={meta.coverImage} alt={meta.title} class="h-auto w-full" />
          </div>
        </div>
      {/if}

      <!-- テキストコンテンツを右側に配置 -->
      <div class="flex w-full flex-col justify-center lg:w-1/2">
        <!-- カテゴリと日付 -->
        <div class="mb-4 flex flex-wrap items-center justify-between">
          {#if meta.category}
            <div class="mb-2 sm:mb-0">
              <a
                href={`/category/${encodeURIComponent(meta.category.toLowerCase())}/1`}
                class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {meta.category}
              </a>
            </div>
          {/if}

          {#if meta.publishedAt || meta.updatedAt}
            <div class="flex items-center text-sm text-gray-500">
              {#if meta.updatedAt}
                <svg
                  class="mr-1 h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <time datetime={meta.updatedAt.toISOString()} class="leading-relaxed">
                  {meta.updatedAt.toISOString().split('T')[0]}
                </time>
              {:else}
                <svg
                  class="mr-1 h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <time datetime={meta.publishedAt.toISOString()} class="leading-relaxed">
                  {meta.publishedAt.toISOString().split('T')[0]}
                </time>
              {/if}
            </div>
          {/if}
        </div>

        <!-- タイトル -->
        <h1 class="mb-6 text-2xl font-bold leading-tight text-gray-900 md:text-3xl lg:text-4xl">
          {meta.title}
        </h1>

        <!-- タグ -->
        {#if meta.tags && meta.tags.length > 0}
          <div class="mb-6 flex flex-wrap gap-2">
            {#each meta.tags as tag}
              <a
                href={`/tag/${encodeURIComponent(tag.toLowerCase())}/1`}
                class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200"
              >
                {tag}
              </a>
            {/each}
          </div>
        {/if}

        <!-- リード文 -->
        {#if meta.description}
          <p class="description-text text-gray-700">
            {meta.description}
          </p>
        {/if}
      </div>
    </div>
  </div>
</header>

<style>
  .description-text {
    /* タブレット以下では全文表示 */
  }

  @media (min-width: 1024px) {
    .description-text {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
