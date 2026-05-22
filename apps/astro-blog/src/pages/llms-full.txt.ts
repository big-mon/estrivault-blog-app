import type { APIRoute } from 'astro';
import { getAllPostsMeta } from '$lib/content';
import { getCategoryLabel, SITE_URL, SOCIAL_LINK_X, SOCIAL_LINK_GITHUB } from '$constants';

export const prerender = true;

const escapeMarkdownText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\[|]|\(|\)/g, '\\$&')
    .trim();

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

- **investing / 投資・企業分析**: US stock analysis, industry analysis, investment strategies, SEC filing research
- **software / 開発・Web**: Web development, APIs, XBRL/EDGAR data access, blog platform work, development environments
- **ai / AI・生成ツール**: Claude Code, ChatGPT, Stable Diffusion, generative AI workflows
- **games / ゲーム**: Game guides, mods, translations, settings, troubleshooting
- **gear / ギア・装備レビュー**: Airsoft gear, desk setups, audio, keyboards, physical gadgets
- **essays / 考察・エッセイ**: Personal essays, social and business commentary, opinion pieces
- **meta / このサイトについて**: About and site operation notes

## All Articles (${posts.length} total)

${posts
  .map(
    (post) =>
      `- [${escapeMarkdownText(post.title)}](${siteBase}/post/${encodeURIComponent(post.slug)}) (${post.publishedAt.toISOString().split('T')[0]}) [${escapeMarkdownText(getCategoryLabel(post.category))}] - ${escapeMarkdownText(post.description || 'Detailed article description')}`,
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
