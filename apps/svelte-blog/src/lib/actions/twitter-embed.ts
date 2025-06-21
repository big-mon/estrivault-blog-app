import { twitterService } from '$lib/services/twitter';
import type { ActionReturn } from 'svelte/action';

/**
 * Twitter埋め込み用のSvelteアクション
 * Twitter埋め込み要素がある場合のみウィジェットを読み込み
 *
 * 使用例:
 * ```svelte
 * <div use:twitterEmbed>
 *   <!-- Twitter埋め込みを含むコンテンツ -->
 * </div>
 * ```
 */
export function twitterEmbed(node: HTMLElement): ActionReturn {
  let abortController: AbortController | null = null;

  async function loadTwitterWidgets() {
    // Twitter埋め込み要素があるかチェック
    if (!node.querySelector('.twitter-tweet')) return;

    // 既存の処理をキャンセル
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    try {
      await twitterService.loadWidgets(node);
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('[TwitterEmbed] Failed to load Twitter widgets:', error);
        showFallbackLinks(node);
      }
    }
  }

  /**
   * Twitter埋め込みが失敗した場合のフォールバック
   */
  function showFallbackLinks(container: HTMLElement) {
    const twitterEmbeds = container.querySelectorAll('.twitter-tweet');

    twitterEmbeds.forEach((embed) => {
      const link = embed.querySelector('a[href*="twitter.com"]') as HTMLAnchorElement;
      if (link) {
        // スタイルを調整してリンクとして機能するようにする
        embed.setAttribute('style', 'border: 1px solid #ddd; padding: 1rem; border-radius: 8px;');

        // "view on X" リンクを強調
        link.style.fontWeight = 'bold';
        link.style.color = '#1da1f2';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });
  }

  /**
   * クリーンアップ処理
   */
  function cleanup() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  }

  // 初期読み込み
  loadTwitterWidgets();

  return {
    destroy() {
      cleanup();
    },
  };
}
