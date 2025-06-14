<script context="module" lang="ts">
  // 型アサーションをモジュールスコープで宣言
  declare const window: Window & {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Header from '$components/Post/Header.svelte';
  import PostBody from '$components/Post/PostBody.svelte';
  import type { PostHTML, PostMeta } from '@estrivault/content-processor';
  import './amazon-card.scss';

  interface PageData {
    post: PostHTML;
    metadata?: PostMeta;
    hasTwitterEmbed: boolean;
  }

  export let data: PageData;
  const post = page.data.post as PostHTML;

  // メタデータを設定
  $: data = {
    ...data,
    metadata: post.meta,
  };

  // Twitter埋め込みがある場合のみスクリプトを読み込み
  onMount(async () => {
    if (data.hasTwitterEmbed) {
      await loadTwitterWidgets();
    }
  });

  async function loadTwitterWidgets() {
    // すでに読み込まれている場合は再初期化のみ
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      return;
    }

    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://platform.twitter.com/widgets.js';
      script.onload = () => {
        // Twitter ウィジェットが完全に読み込まれるのを待つ
        const checkTwttr = setInterval(() => {
          if (window.twttr?.widgets) {
            clearInterval(checkTwttr);
            window.twttr.widgets.load();
            resolve();
          }
        }, 100);
      };
      document.head.appendChild(script);
    });
  }
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
