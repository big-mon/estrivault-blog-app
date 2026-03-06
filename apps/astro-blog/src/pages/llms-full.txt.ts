import type { APIRoute } from 'astro';
import { getAllPostsMeta } from '$lib/content';
import { SITE_URL, SOCIAL_LINK_X, SOCIAL_LINK_GITHUB } from '$constants';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getAllPostsMeta();
  const siteBase = SITE_URL.replace(/\/$/, '');

  const body = `# Estrilda Blog - Complete Article List

> Personal blog by big-mon covering technology, investments, gaming, and military gear reviews

## About

This site contains technical articles, investment analysis, gaming guides, and military gear reviews, primarily written in Japanese with English technical terms. The content focuses on practical insights and detailed analysis across multiple domains.

## Target Audience

- Japanese tech professionals and developers
- Individual investors interested in US markets
- Gaming enthusiasts (especially Black Desert Online players)
- Tactical gear and airsoft users
- Readers seeking technical content

## Content Categories

- **Tech**: Programming tutorials, hardware reviews, AI/ML experiments, web development
- **Finance**: US market analysis, earnings reviews, investment strategies, individual stock analysis
- **Hobbies**: Gaming guides, tactical gear reviews, workout routines, travel experiences
- **Opinions**: Personal commentary on technology, market trends, and social issues

## All Articles (${posts.length} total)

${posts
  .map(
    (post) =>
      `- [${post.title}](${siteBase}/post/${post.slug}) (${post.publishedAt.toISOString().split('T')[0]}) [${post.category}] - ${post.description || '記事の詳細な解説'}`,
  )
  .join('\n')}

## Site Structure

- Home: ${SITE_URL}
- Posts: ${siteBase}/post/[slug]
- Categories: ${siteBase}/category/[category]/[page]
- Tags: ${siteBase}/tag/[tag]/[page]

## Contact

Site: ${SITE_URL}
Author: big-mon
Twitter: https://x.com/${SOCIAL_LINK_X}
GitHub: https://github.com/${SOCIAL_LINK_GITHUB}`.trim();

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'max-age=0, s-max-age=3600',
    },
  });
};
