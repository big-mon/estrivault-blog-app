<script lang="ts">
  import type { PostMeta } from '@estrivault/content-processor';

  export let meta: PostMeta;
</script>

<header class="py-12 bg-white">
  <div class="container px-4 mx-auto">
    <div class="flex flex-col items-start gap-8 lg:flex-row">
      <!-- 画像を左側に配置（モバイルでは上部） -->
      {#if meta.coverImage}
        <div class="w-full mb-8 lg:mb-0 lg:w-1/2">
          <div class="overflow-hidden border border-gray-200 rounded-lg">
            <img
              src={meta.coverImage}
              alt={meta.title}
              class="w-full h-auto"
            />
          </div>
        </div>
      {/if}

      <!-- テキストコンテンツを右側に配置（モバイルでは下部） -->
      <div class="w-full lg:w-1/2">
        <!-- カテゴリ -->
        {#if meta.category}
          <div class="mb-4">
            <span class="text-sm font-medium text-gray-600">
              {meta.category}
            </span>
          </div>
        {/if}

        <!-- タイトル -->
        <h1 class="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
          {meta.title}
        </h1>

        <!-- 公開日 -->
        {#if meta.publishedAt}
          <div class="flex items-center mb-6 text-sm text-gray-500">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              {meta.updatedAt ? '（更新）' : ''}
            </time>
          </div>
        {/if}

        <!-- タグ -->
        {#if meta.tags && meta.tags.length > 0}
          <div class="flex flex-wrap gap-2 mb-6">
            {#each meta.tags as tag}
              <span class="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
                {tag}
              </span>
            {/each}
          </div>
        {/if}

        <!-- リード文（もしあれば） -->
        {#if meta.description}
          <p class="text-gray-700 leading-relaxed">
            {meta.description}
          </p>
        {/if}
      </div>
    </div>
  </div>
</header>
