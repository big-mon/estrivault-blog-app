<script lang="ts">
  import Header from '$components/Post/Header.svelte';
  import PostBody from '$components/Post/PostBody.svelte';
  import TableOfContents from '$components/Post/TableOfContents.svelte';
  import EditOnGitHub from '$components/Post/EditOnGitHub.svelte';
  import GitHubContributors from '$components/Post/GitHubContributors.svelte';
  import { SITE_TITLE, SITE_AUTHOR, SITE_URL, SOCIAL_LINK_X } from '$constants';
  import type { PostHTML, PostMeta } from '@estrivault/content-processor';
  import type { Contributor } from '$lib/types/github';
  import { twitterEmbed } from '$lib/actions/twitter-embed';

  interface PageData {
    post: PostHTML;
    metadata?: PostMeta;
    contributors: Contributor[];
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.description || `${post.meta.title}についての記事です。`,
    image: post.meta.coverImage ? [post.meta.coverImage] : undefined,
    author: {
      '@type': 'Person',
      name: 'big-mon',
      url: `https://x.com/${SOCIAL_LINK_X}`,
      sameAs: [`https://x.com/${SOCIAL_LINK_X}`, `https://github.com/big-mon`],
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_TITLE,
      url: SITE_URL,
    },
    datePublished: post.meta.publishedAt.toISOString(),
    dateModified:
      post.meta.updatedAt ? post.meta.updatedAt.toISOString() : post.meta.publishedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL.replace(/\/$/, '')}/post/${post.meta.slug}`,
    },
    articleSection: post.meta.category,
    keywords: [post.meta.category]
      .concat(post.meta.tags || [])
      .filter(Boolean)
      .join(', '),
    wordCount: post.html ? getJapaneseWordCount(post.html) : 0,
    timeRequired: post.meta.readingTime ? `PT${Math.ceil(post.meta.readingTime)}M` : undefined,
    inLanguage: 'ja-JP',
    url: `${SITE_URL.replace(/\/$/, '')}/post/${post.meta.slug}`,
  };
</script>

<svelte:head>
  <title>{post.meta.title} | {SITE_TITLE}</title>
  <meta
    name="description"
    content={post.meta.description || `${post.meta.title}についての記事です。`}
  />
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
  <meta
    property="og:description"
    content={post.meta.description || `${post.meta.title}についての記事です。`}
  />
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
    {#each post.meta.tags as tag (tag)}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:creator" content={`@${SOCIAL_LINK_X}`} />
  <meta name="twitter:title" content={post.meta.title} />
  <meta
    name="twitter:description"
    content={post.meta.description || `${post.meta.title}についての記事です。`}
  />
  {#if post.meta.coverImage}
    <meta name="twitter:image" content={post.meta.coverImage} />
    <meta name="twitter:image:alt" content={post.meta.title} />
  {/if}

  <!-- Canonical URL -->
  <link rel="canonical" href={`${SITE_URL}/post/${post.meta.slug}`} />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
    {JSON.stringify(schemaData)}
  </script>

  <!-- Google AdSense -->
  <script
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6950127103154689"
    crossorigin="anonymous"
  ></script>
</svelte:head>

<article class="container mx-auto px-2 sm:px-4 xl:max-w-6xl" use:twitterEmbed>
  <Header meta={post.meta} />
  <div class="xl:flex xl:gap-8">
    <div class="xl:max-w-4xl xl:flex-1">
      <div class="xl:hidden">
        <TableOfContents headings={post.headings} />
      </div>

      <PostBody {post} />

      {#if post.originalPath}
        <div class="post-footer">
          <div class="post-footer-content">
            <div class="post-footer-edit">
              <EditOnGitHub originalPath={post.originalPath} />
            </div>
            <div class="post-footer-contributors">
              <GitHubContributors contributors={data.contributors} />
            </div>
          </div>
        </div>
      {/if}
    </div>

    <aside class="hidden xl:block xl:w-64 xl:flex-shrink-0">
      <TableOfContents headings={post.headings} />
    </aside>
  </div>
</article>

<style>
  .post-footer {
    margin-top: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .post-footer-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .post-footer-edit {
    display: flex;
    justify-content: center;
  }

  .post-footer-contributors {
    display: flex;
    justify-content: center;
  }

  @media (min-width: 640px) {
    .post-footer-content {
      flex-direction: row;
      align-items: flex-start;
      gap: 2rem;
    }

    .post-footer-edit {
      flex-shrink: 0;
      justify-content: flex-start;
    }

    .post-footer-contributors {
      flex-shrink: 0;
      justify-content: flex-start;
    }
  }
</style>
