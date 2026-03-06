import type { APIRoute } from 'astro';
import type { PostMeta } from '@estrivault/content-processor';
import { POSTS_PER_PAGE, SITE_URL } from '$constants';
import { getAllCategories, getAllPostsMeta, getAllTags, getPosts } from '$lib/content';
import { getTagRouteSegment } from '$lib/url-segments';

export const prerender = true;

function encodeSegment(segment: string): string {
  return encodeURIComponent(segment.toLowerCase());
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const siteBase = SITE_URL.replace(/\/$/, '');
  const posts = await getAllPostsMeta();

  const categories = await getAllCategories();
  const categoryUrls: string[] = [];

  for (const category of categories) {
    const categoryPosts = await getPosts({ category, perPage: POSTS_PER_PAGE });
    const encodedCategory = encodeSegment(category);

    for (let page = 1; page <= categoryPosts.totalPages; page++) {
      categoryUrls.push(`<url>
    <loc>${xmlEscape(`${siteBase}/category/${encodedCategory}/${page}`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  const tags = await getAllTags();
  const tagUrls: string[] = [];

  for (const tag of tags) {
    const tagPosts = await getPosts({ tag, perPage: POSTS_PER_PAGE });
    const encodedTag = getTagRouteSegment(tag);

    for (let page = 1; page <= tagPosts.totalPages; page++) {
      tagUrls.push(`<url>
    <loc>${xmlEscape(`${siteBase}/tag/${encodedTag}/${page}`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }
  }

  const postUrls = posts
    .map(
      (post: PostMeta) => `<url>
    <loc>${xmlEscape(`${siteBase}/post/${encodeURIComponent(post.slug)}`)}</loc>
    <lastmod>${(post.updatedAt || post.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(SITE_URL)}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${xmlEscape(`${siteBase}/llms.txt`)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${xmlEscape(`${siteBase}/llms-full.txt`)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  ${postUrls}
  ${categoryUrls.join('')}
  ${tagUrls.join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
