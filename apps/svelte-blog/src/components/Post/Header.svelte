<script lang="ts">
  import type { PostMeta } from '@estrivault/content-processor';

  export let meta: PostMeta;
</script>

<header class="bg-white py-12">
  <div class="container mx-auto px-4">
    <div class="flex flex-col items-start gap-8 lg:flex-row">
      <!-- 画像を左側に配置 -->
      {#if meta.coverImage}
        <div class="mb-8 w-full lg:mb-0 lg:w-1/2">
          <div class="overflow-hidden rounded-lg border border-gray-200">
            <img src={meta.coverImage} alt={meta.title} class="h-auto w-full" />
          </div>
        </div>
      {/if}

      <!-- テキストコンテンツを右側に配置 -->
      <div class="w-full lg:w-1/2">
        <!-- カテゴリ -->
        {#if meta.category}
          <div class="mb-4">
            <a
              href={`/category/${encodeURIComponent(meta.category.toLowerCase())}/1`}
              class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {meta.category}
            </a>
          </div>
        {/if}

        <!-- タイトル -->
        <h1 class="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
          {meta.title}
        </h1>

        <!-- 公開日 -->
        {#if meta.publishedAt}
          <div class="mb-6 flex items-center text-sm text-gray-500">
            <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <time datetime={new Date(meta.publishedAt).toISOString()} class="leading-relaxed">
              {new Date(meta.publishedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {meta.updatedAt ? '(更新)' : ''}
            </time>
          </div>
        {/if}

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
          <p class="leading-relaxed text-gray-700">
            {meta.description}
          </p>
        {/if}
      </div>
    </div>
  </div>
</header>
