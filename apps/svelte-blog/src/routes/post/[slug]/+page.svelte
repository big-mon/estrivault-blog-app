<script context="module" lang="ts">
  // 型アサーションをモジュールスコープで宣言
  declare global {
    interface Window {
      twttr?: {
        widgets: {
          load(): Promise<void>;
        };
        ready?: (callback: () => void) => void;
      };
    }
  }
</script>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Header from '$components/Post/Header.svelte';
  import PostBody from '$components/Post/PostBody.svelte';
  import { SITE_TITLE, SITE_AUTHOR } from '$constants';
  import type { PostHTML, PostMeta } from '@estrivault/content-processor';
  import './amazon-card.scss';
  import './twitter-embed.scss';
  import './post-links.scss';

  interface PageData {
    post: PostHTML;
    metadata?: PostMeta;
    hasTwitterEmbed: boolean;
  }

  export let data: PageData;
  $: post = data.post as PostHTML;


  // Twitter埋め込みがある場合のみスクリプトを読み込み
  onMount(async () => {
    if (data.hasTwitterEmbed) {
      // DOMが完全に描画されるまで待つ
      await tick();
      await loadTwitterWidgets();
    }
  });

  async function loadTwitterWidgets(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (window.twttr) {
        // 既に存在する場合は即座に実行
        console.log('Twitter already loaded, calling widgets.load()');
        window.twttr.widgets.load().then(() => {
          console.log('Twitter widgets loaded successfully');
          resolve();
        });
        return;
      }

      // Twitter スクリプトが既に存在するかチェック
      const existingScript = document.getElementById('twitter-wjs');
      if (existingScript) {
        // スクリプトは存在するがtwttrがまだ利用できない場合
        const checkTwttr = () => {
          if (window.twttr) {
            window.twttr.widgets.load().then(() => resolve());
          } else {
            setTimeout(checkTwttr, 100);
          }
        };
        checkTwttr();
        return;
      }

      // 新しくスクリプトを作成
      console.log('Loading Twitter script...');
      const script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.async = true;
      script.src = 'https://platform.twitter.com/widgets.js';

      script.onload = () => {
        console.log('Twitter script loaded');
        const waitForTwttr = () => {
          if (window.twttr && window.twttr.widgets) {
            console.log('Calling widgets.load()');
            window.twttr.widgets
              .load()
              .then(() => {
                console.log('Widgets loaded successfully');
                resolve();
              })
              .catch((err) => {
                console.error('Error loading widgets:', err);
                resolve();
              });
          } else {
            setTimeout(waitForTwttr, 50);
          }
        };
        waitForTwttr();
      };

      script.onerror = () => {
        console.error('Failed to load Twitter script');
        resolve();
      };

      document.head.appendChild(script);
    });
  }

</script>

<svelte:head>
  <title>{post.meta.title} | {SITE_TITLE}</title>
  <meta name="description" content={post.meta.description || post.meta.description || `${post.meta.title}についての記事です。`} />
  {#if post.meta.tags && post.meta.tags.length > 0}
    <meta name="keywords" content={post.meta.tags.join(', ')} />
  {/if}
  <meta name="author" content={SITE_AUTHOR} />
  {#if post.meta}
    <meta name="published" content={new Date(post.meta.publishedAt).toISOString()} />
    {#if post.meta.updatedAt}
      <meta name="updated" content={new Date(post.meta.updatedAt).toISOString()} />
    {/if}
  {/if}
  <meta property="og:title" content={post.meta.title} />
  <meta property="og:description" content={post.meta.description || post.meta.description || `${post.meta.title}についての記事です。`} />
  <meta property="og:type" content="article" />
  {#if post.meta.coverImage}
    <meta property="og:image" content={post.meta.coverImage} />
  {/if}
</svelte:head>

<article class="container mx-auto px-4">
  <Header meta={post.meta} />
  <PostBody {post} />
</article>
