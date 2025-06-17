import { getPosts } from '$lib/posts';
import { SITE_URL } from '$constants';
import { POSTS_PER_PAGE } from '$constants';
import type { PostMeta } from '@estrivault/content-processor';

// ISR設定
export const config = {
  isr: {
    // 1日キャッシュ（86400秒）
    expiration: 86400,
  },
};

export async function GET() {
  const { posts } = await getPosts({ perPage: 1000 });

  // Generate category URLs (lowercase for consistency)
  const categories = [...new Set(posts.map((post) => post.category))];
  const categoryUrls = [];
  for (const category of categories) {
    const categoryPosts = await getPosts({ category });
    const totalPages = Math.ceil(categoryPosts.total / POSTS_PER_PAGE);

    for (let page = 1; page <= totalPages; page++) {
      categoryUrls.push(`<url>
    <loc>${SITE_URL.replace(/\/$/, '')}/category/${category.toLowerCase()}/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  // Generate tag URLs (lowercase for consistency)
  const tags = new Set<string>();
  posts.forEach((post: PostMeta) => {
    post.tags?.forEach((tag: string) => tags.add(tag));
  });

  const tagUrls = [];
  for (const tag of tags) {
    const tagPosts = await getPosts({ tag });
    const totalPages = Math.ceil(tagPosts.total / POSTS_PER_PAGE);

    for (let page = 1; page <= totalPages; page++) {
      tagUrls.push(`<url>
    <loc>${SITE_URL.replace(/\/$/, '')}/tag/${tag.toLowerCase()}/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL.replace(/\/$/, '')}/llms.txt</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL.replace(/\/$/, '')}/llms-full.txt</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  ${posts
    .map(
      (post) => `<url>
    <loc>${SITE_URL.replace(/\/$/, '')}/post/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt || post.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
  ${categoryUrls.join('')}
  ${tagUrls.join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
