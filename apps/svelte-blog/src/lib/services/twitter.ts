// 必要最小限のTwitter Widget API型定義
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load(element?: HTMLElement): Promise<void>;
      };
    };
  }
}

/**
 * Twitter埋め込みサービス - 最小限の実装
 */
class TwitterService {
  private state: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';
  private initPromise: Promise<void> | null = null;

  constructor() {
    // 設定は固定値を使用（過度な抽象化を避ける）
  }

  /**
   * Twitter APIの初期化（冪等性を保証）
   */
  async initialize(): Promise<void> {
    if (this.state === 'loaded') {
      return;
    }

    if (this.state === 'loading' && this.initPromise) {
      return this.initPromise;
    }

    this.state = 'loading';
    this.initPromise = this.loadTwitterScript();

    try {
      await this.initPromise;
      this.state = 'loaded';
    } catch (error) {
      this.state = 'error';
      throw error;
    }
  }

  /**
   * Twitterウィジェットの読み込み
   */
  async loadWidgets(container?: HTMLElement): Promise<void> {
    await this.initialize();

    if (!window.twttr?.widgets) {
      throw new Error('Twitter widgets API not available');
    }

    await window.twttr.widgets.load(container);
  }


  /**
   * Twitterスクリプトの読み込み
   */
  private loadTwitterScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 既にAPIが利用可能な場合
      if (window.twttr?.widgets) {
        resolve();
        return;
      }

      // 既存のスクリプトタグをチェック
      const existingScript = document.getElementById('twitter-wjs') as HTMLScriptElement;
      if (existingScript) {
        this.waitForAPI(resolve, reject);
        return;
      }

      // 新しいスクリプトタグを作成
      const script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.async = true;
      script.src = 'https://platform.twitter.com/widgets.js';

      script.onload = () => {
        this.waitForAPI(resolve, reject);
      };

      script.onerror = () => {
        script.remove();
        reject(new Error('Failed to load Twitter script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Twitter APIの準備完了を待機
   */
  private waitForAPI(resolve: () => void, reject: (error: Error) => void): void {
    const startTime = Date.now();
    const TIMEOUT = 15000; // 15秒固定

    const checkAPI = () => {
      if (window.twttr?.widgets) {
        resolve();
        return;
      }

      if (Date.now() - startTime > TIMEOUT) {
        reject(new Error('Twitter API initialization timeout'));
        return;
      }

      setTimeout(checkAPI, 100);
    };

    checkAPI();
  }
}

// シングルトンインスタンス（設定なし）
export const twitterService = new TwitterService();

export default twitterService;
