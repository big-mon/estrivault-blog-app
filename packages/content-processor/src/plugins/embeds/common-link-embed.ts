import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import type { Paragraph, Link } from 'mdast';
import { fetchOgpMetadata, shouldFetchOgp, type OgpMetadata } from '../../utils/ogp-fetcher';
import type { OgpOptions } from '../../types';

// Constants for styling and configuration
const STYLE_CONSTANTS = {
  DESCRIPTION_MAX_LENGTH: 150,
  MOBILE_BREAKPOINT: '640px',
  COLORS: {
    BACKGROUND: '#ffffff',
    BORDER: '#e1e4e8',
    BORDER_HOVER: '#0969da',
    PLACEHOLDER_BG: '#f6f8fa',
    TITLE: '#24292f',
    DESCRIPTION: '#656d76',
    SITE_NAME: '#8b949e',
    PLACEHOLDER_TEXT: '#8b949e',
  },
  SHADOW: {
    DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.06)',
    HOVER: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  SIZES: {
    MOBILE: { width: 120, height: 120, aspectRatio: '1' },
    DESKTOP: { width: 230, height: 120, aspectRatio: '1.917' },
  },
} as const;

/**
 * プレーンテキストのURLを自動的に埋め込みカードに変換するremarkプラグイン
 * GitHub URL以外の一般的なWebサイトのOGP情報を取得して表示します
 */
interface CommonLinkEmbedOptions {
  ogp?: OgpOptions;
}

export const remarkCommonLinkEmbed: Plugin<[CommonLinkEmbedOptions?]> = (options = {}) => {
  return async (tree) => {
    const tasks: Promise<void>[] = [];

    visit(tree, (node: Node, index?: number, parent?: Node) => {
      // linkノードでURLをチェック (remarkが自動的にURLをlinkに変換するため)
      if (node.type === 'link') {
        const linkNode = node as Link;
        const url = linkNode.url;

        // 単独のリンクの場合（パラグラフ内に1つだけのリンクノード）
        if (parent && parent.type === 'paragraph') {
          const paragraphNode = parent as Paragraph;
          if (paragraphNode.children.length === 1) {
            // OGP処理対象かチェック
            if (shouldFetchOgp(url, options.ogp)) {
              const task = processLinkEmbed(paragraphNode, index, url, options.ogp);
              tasks.push(task);
            }
          }
        }
      }
      return undefined;
    });

    // 全てのOGP取得を並行実行
    await Promise.all(tasks);
  };
};

/**
 * リンクをOGP埋め込みに変換する処理
 */
async function processLinkEmbed(
  parent: Paragraph,
  index: number | undefined,
  url: string,
  ogpOptions?: OgpOptions,
): Promise<void> {
  try {
    // OGPメタデータを取得
    const ogpData = await fetchOgpMetadata(url, ogpOptions);

    if (ogpData && (ogpData.title || ogpData.description)) {
      // OGP埋め込みカードを作成
      const embedNode = createOgpEmbedCard(url, ogpData);

      // 現在のリンクノードをHTML埋め込みに直接置き換え
      if (parent && typeof index === 'number') {
        (parent.children as Node[])[index] = embedNode;
      }
    }
    // OGP取得に失敗した場合は元のリンクのまま残す
  } catch (error) {
    // エラーの場合も元のリンクのまま残す
    console.warn(`Failed to process OGP for ${url}:`, (error as Error).message);
  }
}

/**
 * カードコンテンツの準備
 */
function prepareCardContent(url: string, ogpData: OgpMetadata) {
  const hostname = new URL(url).hostname;
  const title = ogpData.title || hostname;
  const description = ogpData.description || '';
  const image = ogpData.image || '';
  const siteName = ogpData.siteName || hostname;

  // 説明文を適切な長さに制限
  const truncatedDescription =
    description.length > STYLE_CONSTANTS.DESCRIPTION_MAX_LENGTH ?
      description.substring(0, STYLE_CONSTANTS.DESCRIPTION_MAX_LENGTH) + '...'
    : description;

  return {
    title,
    description,
    truncatedDescription,
    image,
    siteName,
  };
}

/**
 * レスポンシブスタイル生成
 */
function generateResponsiveStyles(): string {
  const { DESKTOP } = STYLE_CONSTANTS.SIZES;
  return `<style>
@media (min-width: ${STYLE_CONSTANTS.MOBILE_BREAKPOINT}) {
  .link-card-image {
    width: ${DESKTOP.width}px !important;
    height: ${DESKTOP.height}px !important;
    aspect-ratio: ${DESKTOP.aspectRatio} !important;
  }
}
</style>
`;
}

/**
 * 画像コンテナHTML生成
 */
function generateImageHtml(image: string, title: string): string {
  const { MOBILE } = STYLE_CONSTANTS.SIZES;
  const { PLACEHOLDER_BG, PLACEHOLDER_TEXT } = STYLE_CONSTANTS.COLORS;

  const baseStyle = `flex-shrink: 0; width: ${MOBILE.width}px; height: ${MOBILE.height}px; aspect-ratio: ${MOBILE.aspectRatio}; background: ${PLACEHOLDER_BG}; display: flex; align-items: center; justify-content: center; border-radius: 0 8px 8px 0;`;

  if (image) {
    const errorFallback = `this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: ${PLACEHOLDER_TEXT}; font-size: 14px;\\' role=\\'img\\' aria-label=\\'画像の読み込みに失敗しました\\'>\uD83D\uDDBC\uFE0F</div>';`;

    return `<div style="${baseStyle}" class="link-card-image">
         <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 0 8px 8px 0;" loading="lazy" onerror="${errorFallback}" />
       </div>`;
  }

  return `<div style="${baseStyle} color: ${PLACEHOLDER_TEXT}; font-size: 24px;" class="link-card-image">
         🖼️
       </div>`;
}

/**
 * カードHTML生成
 */
function generateCardHtml(
  url: string,
  content: ReturnType<typeof prepareCardContent>,
  imageHtml: string,
): string {
  const { BACKGROUND, BORDER, BORDER_HOVER, TITLE, DESCRIPTION, SITE_NAME } =
    STYLE_CONSTANTS.COLORS;
  const { DEFAULT: defaultShadow, HOVER: hoverShadow } = STYLE_CONSTANTS.SHADOW;

  const cardStyle = `display: flex; min-height: 120px; width: 100%; border: 1px solid ${BORDER}; border-radius: 8px; background: ${BACKGROUND}; box-shadow: ${defaultShadow}; text-decoration: none; color: inherit; overflow: hidden; transition: all 0.3s ease; cursor: pointer;`;

  const hoverEffects = {
    over: `this.style.transform='translateY(-2px)'; this.style.boxShadow='${hoverShadow}'; this.style.borderColor='${BORDER_HOVER}';`,
    out: `this.style.transform='translateY(0)'; this.style.boxShadow='${defaultShadow}'; this.style.borderColor='${BORDER}';`,
  };

  const titleStyle = `font-weight: 600; font-size: 16px; color: ${TITLE}; line-height: 1.4; margin-bottom: ${content.description ? '8px' : '4px'}; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;`;

  const descriptionHtml =
    content.description ?
      `<div style="font-size: 14px; color: ${DESCRIPTION}; line-height: 1.4; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
      ${escapeHtml(content.truncatedDescription)}
    </div>`
    : '';

  const siteNameHtml = `<div style="font-size: 12px; color: ${SITE_NAME}; display: flex; align-items: center; gap: 6px;">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
      </svg>
      <span>${escapeHtml(content.siteName)}</span>
    </div>`;

  return `<div style="margin: 1rem 0;">
<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="link-card" style="${cardStyle}" onmouseover="${hoverEffects.over}" onmouseout="${hoverEffects.out}">
  <div style="flex: 1; min-width: 0; padding: 16px 20px; display: flex; flex-direction: column; justify-content: center;">
    <div style="${titleStyle}">
      ${escapeHtml(content.title)}
    </div>
    ${descriptionHtml}
    ${siteNameHtml}
  </div>
  ${imageHtml}
</a>
</div>`;
}

/**
 * OGPデータからHTML埋め込みカードを生成
 */
function createOgpEmbedCard(url: string, ogpData: OgpMetadata) {
  const content = prepareCardContent(url, ogpData);
  const styles = generateResponsiveStyles();
  const imageHtml = generateImageHtml(content.image, content.title);
  const cardHtml = generateCardHtml(url, content, imageHtml);

  return {
    type: 'html',
    value: `${styles}${cardHtml}`,
  };
}

/**
 * HTMLエスケープ処理
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m as keyof typeof map] || m);
}
