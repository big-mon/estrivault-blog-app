<script lang="ts">
  import type { PostMeta } from '@estrivault/content-processor';

  export let meta: PostMeta;
</script>

<header class="mb-8">
  <h1 class="mb-4 text-4xl font-bold text-gray-900">
    {meta.title}
  </h1>

  {#if meta.publishedAt}
    <div class="mb-4 text-sm text-gray-500">
      <time datetime={new Date(meta.publishedAt).toISOString()}>
        {new Date(meta.publishedAt).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
    </div>
  {/if}

  {#if meta.tags && meta.tags.length > 0}
    <div class="mb-6 flex flex-wrap gap-2">
      {#each meta.tags as tag}
        <span class="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {tag}
        </span>
      {/each}
    </div>
  {/if}

  {#if meta.coverImage}
    <div class="mb-6 overflow-hidden rounded-lg">
      <img src={meta.coverImage} alt={meta.title} class="h-auto w-full object-cover" />
    </div>
  {/if}
</header>
