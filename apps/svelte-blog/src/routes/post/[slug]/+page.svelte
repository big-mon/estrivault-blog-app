<script context="module" lang="ts">
  // 型アサーションをモジュールスコープで宣言
  declare const window: Window & {
    twttr?: {
      widgets: {
        load(): Promise<void>;
      };
      ready?: (callback: () => void) => void;
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

  async function loadTwitterWidgets(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (window.twttr) {
        // 既に読み込まれている場合は、widgets.load()を呼び出す
        window.twttr.widgets.load().then(() => resolve());
        return;
      }

      // スクリプトが存在しない場合は新しく作成
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://platform.twitter.com/widgets.js';
      script.charset = 'utf-8';
      script.id = 'twitter-wjs';

      script.onload = () => {
        // スクリプト読み込み完了後、twttrが利用可能になるまで待つ
        if (window.twttr && window.twttr.ready) {
          window.twttr.ready(() => {
            window.twttr!.widgets.load().then(() => resolve());
          });
        } else {
          // fallback: 少し待ってからwidgets.load()を呼び出す
          setTimeout(() => {
            if (window.twttr) {
              window.twttr.widgets.load().then(() => resolve());
            } else {
              resolve();
            }
          }, 100);
        }
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
