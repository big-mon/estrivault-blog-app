import type { RequestHandler } from '@sveltejs/kit';
import { getPosts } from '$lib/posts';
import { SITE_URL, SOCIAL_LINK_X, SOCIAL_LINK_GITHUB } from '$constants';

export const prerender = true;

const llmsText = async () => {
  const { posts } = await getPosts({ perPage: 20 });

  const llmsTxt = `# Estrilda Blog

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

## Featured Articles

${posts
  .slice(0, 25)
  .map(
    (post: { title: string; slug: string; publishedAt: Date; description?: string }) =>
      `- [${post.title}](${SITE_URL.replace(/\/$/, '')}/post/${post.slug}) (${post.publishedAt.toISOString().split('T')[0]}) - ${post.description || '記事の詳細な解説'}`,
  )
  .join('\n')}

*For complete article list, see: ${SITE_URL.replace(/\/$/, '')}/llms-full.txt*

## Key Topics

- US equity fundamental analysis and earnings reviews
- SvelteKit and modern web development frameworks
- PC hardware, audio equipment, and gaming peripherals
- Tactical gear, firearms accessories, and outdoor equipment
- Financial APIs (EDGAR) and data analysis
- AI/ML tools including Stable Diffusion and ChatGPT
- Gaming guides (Black Desert Online, various titles)
- Investment strategies and market analysis

## Site Structure

- Home: ${SITE_URL}
- Posts: ${SITE_URL.replace(/\/$/, '')}/post/[slug]
- Categories: ${SITE_URL.replace(/\/$/, '')}/category/[category]/[page]
- Tags: ${SITE_URL.replace(/\/$/, '')}/tag/[tag]/[page]

## Contact

Site: ${SITE_URL}
Author: big-mon
Twitter: https://x.com/${SOCIAL_LINK_X}
GitHub: https://github.com/${SOCIAL_LINK_GITHUB}`.trim();

  return llmsTxt;
};

export const GET: RequestHandler = async () => {
  const headers = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'max-age=0, s-max-age=3600',
  };
  const llmsTxt = await llmsText();

  return new Response(llmsTxt, { headers });
};
