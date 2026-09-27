import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Paragraph } from 'mdast';
import { fetchOgpMetadata, shouldFetchOgp, type OgpMetadata } from '../../utils/ogp-fetcher';
import type { OgpOptions } from '../../types';

/** Shared selection for HTML cards and the metadata refresh command. */
export function findOgpLinks(tree: Root, ogp?: OgpOptions) {
  const links: Array<{ paragraph: Paragraph; url: string }> = [];
  visit(tree, 'paragraph', (paragraph) => {
    const [link] = paragraph.children;
    if (paragraph.children.length === 1 && link?.type === 'link' && shouldFetchOgp(link.url, ogp)) {
      links.push({ paragraph, url: link.url });
    }
  });
  return links;
}

export const remarkCommonLinkEmbed: Plugin<[{ ogp?: OgpOptions }?], Root> = (options = {}) => {
  return async (tree) => {
    await Promise.all(
      findOgpLinks(tree, options.ogp).map(async ({ paragraph, url }) => {
        try {
          const metadata = await fetchOgpMetadata(url, options.ogp);
          if (metadata && (metadata.title || metadata.description)) {
            paragraph.children[0] = { type: 'html', value: createOgpEmbedCard(url, metadata) };
          }
        } catch (error) {
          console.warn(`Failed to process OGP for ${url}:`, (error as Error).message);
        }
      }),
    );
  };
};

function createOgpEmbedCard(url: string, metadata: OgpMetadata): string {
  const hostname = new URL(url).hostname;
  const title = metadata.title || hostname;
  const description = metadata.description || '';
  const truncatedDescription =
    description.length > 150 ? `${description.slice(0, 150)}...` : description;
  const image = metadata.image || '';
  const siteName = metadata.siteName || hostname;

  return `<div class="link-card-wrapper">
<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="link-card">
  <div class="link-card-content">
    <div class="link-card-title${description ? ' link-card-title-with-description' : ''}">${escapeHtml(title)}</div>
    ${description ? `<div class="link-card-description">${escapeHtml(truncatedDescription)}</div>` : ''}
    <div class="link-card-site">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
      </svg>
      <span>${escapeHtml(siteName)}</span>
    </div>
  </div>
  <div class="link-card-image">
    ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.hidden=true; this.parentElement.classList.add('link-card-image-error');" />` : ''}
    <span class="link-card-placeholder" role="img" aria-label="${image ? '画像の読み込みに失敗しました' : '画像なし'}">🖼️</span>
  </div>
</a>
</div>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (character) => map[character] || character);
}
