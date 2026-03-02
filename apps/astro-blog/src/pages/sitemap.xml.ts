import type { APIRoute } from 'astro';
import type { PostMeta } from '@estrivault/content-processor';
import { POSTS_PER_PAGE, SITE_URL } from '$constants';
import { getAllCategories, getAllTags, getPosts } from '$lib/content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const siteBase = SITE_URL.replace(/\/$/, '');
  const { posts } = await getPosts({ perPage: 1000 });

  const categories = await getAllCategories();
  const categoryUrls: string[] = [];

  for (const category of categories) {
    const categoryPosts = await getPosts({ category, perPage: POSTS_PER_PAGE });

    for (let page = 1; page <= categoryPosts.totalPages; page++) {
      categoryUrls.push(`<url>
    <loc>${siteBase}/category/${category.toLowerCase()}/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  const tags = await getAllTags();
  const tagUrls: string[] = [];

  for (const tag of tags) {
    const tagPosts = await getPosts({ tag, perPage: POSTS_PER_PAGE });

    for (let page = 1; page <= tagPosts.totalPages; page++) {
      tagUrls.push(`<url>
    <loc>${siteBase}/tag/${tag.toLowerCase()}/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }
  }

  const postUrls = posts
    .map(
      (post: PostMeta) => `<url>
    <loc>${siteBase}/post/${post.slug}</loc>
    <lastmod>${(post.updatedAt || post.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteBase}/llms.txt</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteBase}/llms-full.txt</loc>
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
