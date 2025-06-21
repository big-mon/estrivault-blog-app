import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import { fetchOgpMetadata, shouldFetchOgp, type OgpMetadata } from '../../utils/ogp-fetcher';

/**
 * プレーンテキストのURLを自動的に埋め込みカードに変換するremarkプラグイン
 * GitHub URL以外の一般的なWebサイトのOGP情報を取得して表示します
 */
export const remarkCommonLinkEmbed: Plugin = () => {
  return async (tree) => {
    const tasks: Promise<void>[] = [];

    visit(tree, (node: any, index?: number, parent?: any) => {
      // linkノードでURLをチェック (remarkが自動的にURLをlinkに変換するため)
      if (node.type === 'link') {
        const url = node.url;
        
        // 単独のリンクの場合（パラグラフ内に1つだけのリンクノード）
        if (parent && parent.type === 'paragraph' && parent.children.length === 1) {
          // OGP処理対象かチェック
          if (shouldFetchOgp(url)) {
            const task = processLinkEmbed(parent, index, url);
            tasks.push(task);
          }
        }
      }
    });

    // 全てのOGP取得を並行実行
    await Promise.all(tasks);
  };
};

/**
 * リンクをOGP埋め込みに変換する処理
 */
async function processLinkEmbed(
  parent: any,
  index: number | undefined,
  url: string
): Promise<void> {
  try {
    // OGPメタデータを取得
    const ogpData = await fetchOgpMetadata(url);
    
    if (ogpData && (ogpData.title || ogpData.description)) {
      // OGP埋め込みカードを作成
      const embedNode = createOgpEmbedCard(url, ogpData);
      
      // 現在のリンクノードをHTML埋め込みに直接置き換え
      if (parent && typeof index === 'number') {
        parent.children[index] = embedNode;
      }
    }
    // OGP取得に失敗した場合は元のリンクのまま残す
  } catch (error) {
    // エラーの場合も元のリンクのまま残す
    console.warn(`Failed to process OGP for ${url}:`, (error as Error).message);
  }
}

/**
 * OGPデータからHTML埋め込みカードを生成
 */
function createOgpEmbedCard(url: string, ogpData: OgpMetadata) {
  const title = ogpData.title || new URL(url).hostname;
  const description = ogpData.description || '';
  const image = ogpData.image || '';
  const siteName = ogpData.siteName || new URL(url).hostname;

  // 説明文を適切な長さに制限
  const truncatedDescription = description.length > 150 
    ? description.substring(0, 150) + '...' 
    : description;

  // 画像部分のHTML（常にプレースホルダ領域を表示）
  // OGP標準アスペクト比 1.91:1を正確に実装
  const imageHtml = image 
    ? `<div style="flex-shrink: 0; width: 200px; aspect-ratio: 1.91; background: #f6f8fa; display: flex; align-items: center; justify-content: center; border-radius: 0 8px 8px 0;">
         <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 0 8px 8px 0;" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #8b949e; font-size: 14px;\\' role=\\'img\\' aria-label=\\'画像の読み込みに失敗しました\\'>🖼️</div>';" />
       </div>`
    : `<div style="flex-shrink: 0; width: 200px; aspect-ratio: 1.91; background: #f6f8fa; display: flex; align-items: center; justify-content: center; border-radius: 0 8px 8px 0; color: #8b949e; font-size: 24px;">
         🖼️
       </div>`;

  // カードスタイルを統一（常にflexレイアウト）
  // min-heightはaspect-ratioに合わせて自動計算（200px ÷ 1.91 ≈ 104.7px）
  const cardStyle = 'display: flex; min-height: 104.7px; width: 100%;';

  return {
    type: 'html',
    value: `<div style="margin: 1rem 0;">
<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="${cardStyle} border: 1px solid #e1e4e8; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); text-decoration: none; color: inherit; overflow: hidden; transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 16px rgba(0, 0, 0, 0.12)'; this.style.borderColor='#0969da';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.06)'; this.style.borderColor='#e1e4e8';">
  <div style="flex: 1; min-width: 0; padding: 16px 20px; display: flex; flex-direction: column; justify-content: center;">
    <div style="font-weight: 600; font-size: 16px; color: #24292f; line-height: 1.4; margin-bottom: ${description ? '8px' : '4px'}; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
      ${escapeHtml(title)}
    </div>
    ${description ? `<div style="font-size: 14px; color: #656d76; line-height: 1.4; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
      ${escapeHtml(truncatedDescription)}
    </div>` : ''}
    <div style="font-size: 12px; color: #8b949e; display: flex; align-items: center; gap: 6px;">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
      </svg>
      <span>${escapeHtml(siteName)}</span>
    </div>
  </div>
  ${imageHtml}
</a>
</div>`
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
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}