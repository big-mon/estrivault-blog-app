<script lang="ts">
  import { page } from '$app/state';
  import Header from '$components/Post/Header.svelte';
  import PostBody from '$components/Post/PostBody.svelte';
  import type { PostHTML, PostMeta } from '@estrivault/content-processor';
  import './amazon-card.scss';

  interface PageData {
    post: PostHTML;
    metadata?: PostMeta;
  }

  export let data: PageData;
  const post = page.data.post as PostHTML;

  // メタデータを設定
  $: data = {
    ...data,
    metadata: post.meta,
  };
</script>

<svelte:head>
  {#if data.metadata}
    <meta name="published" content={new Date(data.metadata.publishedAt).toISOString()} />
    {#if data.metadata.updatedAt}
      <meta name="updated" content={new Date(data.metadata.updatedAt).toISOString()} />
    {/if}
  {/if}
</svelte:head>

<article class="container mx-auto px-4">
  <Header meta={post.meta} />
  <PostBody {post} />
</article>
