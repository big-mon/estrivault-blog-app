import { getPosts } from '$lib/posts';
import { SITE_URL, SOCIAL_LINK_X, SOCIAL_LINK_GITHUB } from '$constants';

// ISR設定
export const config = {
  isr: {
    // 6時間キャッシュ（21600秒）
    expiration: 21600,
  },
};

export async function GET() {
  const { posts } = await getPosts({ perPage: 1000 });

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

- **Tech**: Programming tutorials, hardware reviews, AI/ML experiments
- **Stocks**: US market analysis, earnings reviews, investment strategies
- **Gaming**: Game guides, optimization tips, hardware recommendations
- **Military**: Tactical gear reviews, optics evaluation, setup guides
- **Opinions**: Personal commentary on technology and market trends

## Featured Articles

${posts
  .slice(0, 25)
  .map(
    (post: { title: string; slug: string; publishedAt: string; description?: string }) =>
      `- [${post.title}](${SITE_URL.replace(/\/$/, '')}/post/${post.slug}) (${new Date(post.publishedAt).toISOString().split('T')[0]}) - ${post.description || '記事の詳細な解説'}`,
  )
  .join('\n')}

*For complete article list, see: ${SITE_URL.replace(/\/$/, '')}/llms-full.txt*

## Key Topics

- US equity fundamental analysis
- SvelteKit and modern web development
- PC hardware and audio equipment
- Tactical equipment evaluation
- EDGAR API integration
- Stable Diffusion experimentation
- Black Desert Online character optimization

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

  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
