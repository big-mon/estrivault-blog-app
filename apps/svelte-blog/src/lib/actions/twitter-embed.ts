import { twitterService } from '$lib/services/twitter';
import type { ActionReturn } from 'svelte/action';

export interface TwitterEmbedParams {
  /** Twitter埋め込みが有効かどうか */
  enabled?: boolean;
  /** デバッグモードを有効にするか */
  debug?: boolean;
}

/**
 * Twitter埋め込み用のSvelteアクション
 *
 * 使用例:
 * ```svelte
 * <div use:twitterEmbed={{ enabled: hasTwitterEmbed }}>
 *   <!-- Twitter埋め込みを含むコンテンツ -->
 * </div>
 * ```
 */
export function twitterEmbed(
  node: HTMLElement,
  params: TwitterEmbedParams = {}
): ActionReturn<TwitterEmbedParams> {
  let { enabled = false, debug = false } = params;
  let abortController: AbortController | null = null;

  async function loadTwitterWidgets() {
    if (!enabled) {
      if (debug) console.log('[TwitterEmbed] Twitter embed disabled');
      return;
    }

    // 既存の処理をキャンセル
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    try {
      if (debug) console.log('[TwitterEmbed] Loading Twitter widgets...');

      // Twitter APIサービスを使用してウィジェットを読み込み
      await twitterService.loadWidgets(node);

      if (!abortController.signal.aborted && debug) {
        console.log('[TwitterEmbed] Twitter widgets loaded successfully');
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('[TwitterEmbed] Failed to load Twitter widgets:', error);

        // フォールバック: リンクのみ表示
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
    update(newParams: TwitterEmbedParams) {
      const prevEnabled = enabled;
      enabled = newParams.enabled ?? false;
      debug = newParams.debug ?? false;

      // enabledの状態が変わった場合のみ再読み込み
      if (enabled !== prevEnabled) {
        loadTwitterWidgets();
      }
    },

    destroy() {
      cleanup();
    },
  };
}
