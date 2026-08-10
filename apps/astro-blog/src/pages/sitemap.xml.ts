import type { APIRoute } from 'astro';
import { getPublicDiscoveryInventory } from '$lib/public-discovery';

export const prerender = true;

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const entries = await getPublicDiscoveryInventory();
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(entry.url)}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod.toISOString()}</lastmod>\n` : ''}    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
