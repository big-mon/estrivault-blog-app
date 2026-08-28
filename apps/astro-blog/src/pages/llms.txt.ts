import type { APIRoute } from 'astro';
import { SITE_DESCRIPTION, SITE_URL, SOCIAL_LINK_GITHUB, SOCIAL_LINK_X } from '$constants';

export const prerender = true;

export const GET: APIRoute = () => {
  const siteBase = SITE_URL.replace(/\/$/, '');
  const body = `# Estrilda Blog

> ${SITE_DESCRIPTION}

Primarily Japanese, with English technical terms where useful.

## Start here

- XML sitemap: ${siteBase}/sitemap.xml
- Markdown sitemap: ${siteBase}/sitemap.md
- API root: ${siteBase}/api/v1/index.json
- API catalog: ${siteBase}/.well-known/api-catalog

## Public routes

- Home and paginated archive: ${SITE_URL} and ${siteBase}/[page]/
- Posts: ${siteBase}/post/[slug]
- Notes archive and notes: ${siteBase}/notes/ and ${siteBase}/notes/[slug]
- Categories: ${siteBase}/category/[category]/ and ${siteBase}/category/[category]/[page]/
- Tags: ${siteBase}/tag/[tag]/ and ${siteBase}/tag/[tag]/[page]/

## Canonical representation

Canonical article and note representations are the public HTML document URLs. Use sitemap.xml for standards-based crawling and sitemap.md for a readable inventory; both list the same canonical resources.

## Contact

- Site: ${SITE_URL}
- Author: big-mon
- X: https://x.com/${SOCIAL_LINK_X}
- GitHub: https://github.com/${SOCIAL_LINK_GITHUB}`.trim();

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'max-age=0, s-max-age=3600',
    },
  });
};
