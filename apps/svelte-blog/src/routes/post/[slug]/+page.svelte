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
  import TableOfContents from '$components/Post/TableOfContents.svelte';
  import { SITE_TITLE, SITE_AUTHOR, SITE_URL, SOCIAL_LINK_X } from '$constants';
  import type { PostHTML, PostMeta } from '@estrivault/content-processor';

  interface PageData {
    post: PostHTML;
    metadata?: PostMeta;
    hasTwitterEmbed: boolean;
  }

  export let data: PageData;
  $: post = data.post as PostHTML;
  
  // 日本語文字数カウント関数
  const getJapaneseWordCount = (content: string) => {
    // HTMLタグを除去
    const textOnly = content.replace(/<[^>]*>/g, '');
    // 改行、空白を除去
    const cleanText = textOnly.replace(/\s+/g, '');
    // 日本語文字のみをカウント（ひらがな、カタカナ、漢字）
    const japaneseChars = cleanText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g);
    return japaneseChars ? japaneseChars.length : 0;
  };
  
  // Schema.org構造化データ
  $: schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.meta.title,
    "description": post.meta.description || `${post.meta.title}についての記事です。`,
    "image": post.meta.coverImage ? [post.meta.coverImage] : undefined,
    "author": {
      "@type": "Person",
      "name": "big-mon",
      "url": `https://x.com/${SOCIAL_LINK_X}`,
      "sameAs": [
        `https://x.com/${SOCIAL_LINK_X}`,
        `https://github.com/big-mon`
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_TITLE,
      "url": SITE_URL
    },
    "datePublished": post.meta.publishedAt.toISOString(),
    "dateModified": post.meta.updatedAt ? post.meta.updatedAt.toISOString() : post.meta.publishedAt.toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL.replace(/\/$/, '')}/post/${post.meta.slug}`
    },
    "articleSection": post.meta.category,
    "keywords": [post.meta.category].concat(post.meta.tags || []).filter(Boolean).join(', '),
    "wordCount": post.html ? getJapaneseWordCount(post.html) : 0,
    "timeRequired": post.meta.readingTime ? `PT${Math.ceil(post.meta.readingTime)}M` : undefined,
    "inLanguage": "ja-JP",
    "url": `${SITE_URL.replace(/\/$/, '')}/post/${post.meta.slug}`
  };


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
    <meta name="published" content={post.meta.publishedAt.toISOString()} />
    {#if post.meta.updatedAt}
      <meta name="updated" content={post.meta.updatedAt.toISOString()} />
    {/if}
  {/if}
  <!-- Open Graph -->
  <meta property="og:title" content={post.meta.title} />
  <meta property="og:description" content={post.meta.description || post.meta.description || `${post.meta.title}についての記事です。`} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={`${SITE_URL}/post/${post.meta.slug}`} />
  <meta property="og:site_name" content={SITE_TITLE} />
  <meta property="og:locale" content="ja_JP" />
  {#if post.meta.coverImage}
    <meta property="og:image" content={post.meta.coverImage} />
    <meta property="og:image:alt" content={post.meta.title} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  
  <!-- Article specific -->
  <meta property="article:author" content={SITE_AUTHOR} />
  <meta property="article:published_time" content={post.meta.publishedAt.toISOString()} />
  {#if post.meta.updatedAt}
    <meta property="article:modified_time" content={post.meta.updatedAt.toISOString()} />
  {/if}
  {#if post.meta.category}
    <meta property="article:section" content={post.meta.category} />
  {/if}
  {#if post.meta.tags && post.meta.tags.length > 0}
    {#each post.meta.tags as tag}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:creator" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:title" content={post.meta.title} />
  <meta name="twitter:description" content={post.meta.description || post.meta.description || `${post.meta.title}についての記事です。`} />
  {#if post.meta.coverImage}
    <meta name="twitter:image" content={post.meta.coverImage} />
    <meta name="twitter:image:alt" content={post.meta.title} />
  {/if}
  
  <!-- Canonical URL -->
  <link rel="canonical" href={`${SITE_URL}/post/${post.meta.slug}`} />
  
  <!-- Google AdSense -->
  <script
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6950127103154689"
    crossorigin="anonymous"
  ></script>
  
  <!-- Schema.org Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(schemaData)}</script>`}
</svelte:head>

<article class="container mx-auto px-4 xl:max-w-6xl">
  <Header meta={post.meta} />
  <div class="xl:flex xl:gap-8">
    <div class="xl:flex-1 xl:max-w-4xl">
      <div class="xl:hidden">
        <TableOfContents headings={post.headings} />
      </div>
      <PostBody {post} />
    </div>
    <aside class="hidden xl:block xl:w-64 xl:flex-shrink-0">
      <TableOfContents headings={post.headings} />
    </aside>
  </div>
</article>
