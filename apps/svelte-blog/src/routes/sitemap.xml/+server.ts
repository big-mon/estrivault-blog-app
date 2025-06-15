import { getPosts } from '$lib/posts';
import { SITE_URL } from '$constants';

export async function GET() {
  const { posts } = await getPosts({ perPage: 1000 });
  
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
  ${posts.map(post => `<url>
    <loc>${SITE_URL.replace(/\/$/, '')}/post/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt || post.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}