import type {
  TwitterEmbedState,
  TwitterServiceOptions,
  TwitterWidgetOptions,
} from '$lib/types/twitter';

/**
 * Twitter埋め込みサービス
 * スクリプトの読み込み、初期化、エラーハンドリングを一元管理
 */
class TwitterService {
  private state: TwitterEmbedState = 'idle';
  private initPromise: Promise<void> | null = null;
  private options: Required<TwitterServiceOptions>;

  constructor(options: TwitterServiceOptions = {}) {
    this.options = {
      timeout: options.timeout ?? 15000, // 15秒
      debug: options.debug ?? false,
      defaultWidgetOptions: options.defaultWidgetOptions ?? {
        theme: 'light',
        dnt: true,
        conversation: 'none',
      },
    };
  }

  /**
   * Twitter APIの初期化（冪等性を保証）
   */
  async initialize(): Promise<void> {
    if (this.state === 'loaded') {
      this.log('Twitter API already loaded');
      return;
    }

    if (this.state === 'loading' && this.initPromise) {
      this.log('Twitter API loading in progress, waiting...');
      return this.initPromise;
    }

    this.state = 'loading';
    this.initPromise = this.loadTwitterScript();

    try {
      await this.initPromise;
      this.state = 'loaded';
      this.log('Twitter API loaded successfully');
    } catch (error) {
      this.state = 'error';
      this.log('Failed to load Twitter API:', error);
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

    try {
      await window.twttr.widgets.load(container);
      this.log('Twitter widgets loaded successfully');
    } catch (error) {
      this.log('Error loading Twitter widgets:', error);
      throw new Error(`Failed to load Twitter widgets: ${error}`);
    }
  }

  /**
   * 単一ツイートの埋め込み
   */
  async embedTweet(
    tweetId: string,
    container: HTMLElement,
    options?: TwitterWidgetOptions
  ): Promise<HTMLElement> {
    await this.initialize();

    if (!window.twttr?.widgets) {
      throw new Error('Twitter widgets API not available');
    }

    const widgetOptions = { ...this.options.defaultWidgetOptions, ...options };

    try {
      const element = await window.twttr.widgets.createTweet(tweetId, container, widgetOptions);
      if (!element) {
        throw new Error('Failed to create tweet embed');
      }
      this.log(`Tweet ${tweetId} embedded successfully`);
      return element;
    } catch (error) {
      this.log(`Error embedding tweet ${tweetId}:`, error);
      throw new Error(`Failed to embed tweet: ${error}`);
    }
  }

  /**
   * 現在の状態を取得
   */
  getState(): TwitterEmbedState {
    return this.state;
  }

  /**
   * APIが利用可能かチェック
   */
  isAvailable(): boolean {
    return this.state === 'loaded' && !!window.twttr?.widgets;
  }

  /**
   * サービスをリセット（テスト用）
   */
  reset(): void {
    this.state = 'idle';
    this.initPromise = null;
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
        this.log('Twitter script loaded');
        this.waitForAPI(resolve, reject);
      };

      script.onerror = () => {
        const error = new Error('Failed to load Twitter script');
        this.log('Script load error:', error);
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Twitter APIの準備完了を待機
   */
  private waitForAPI(resolve: () => void, reject: (error: Error) => void): void {
    const startTime = Date.now();

    const checkAPI = () => {
      if (window.twttr?.widgets) {
        resolve();
        return;
      }

      if (Date.now() - startTime > this.options.timeout) {
        const error = new Error(
          `Twitter API initialization timeout after ${this.options.timeout}ms`
        );
        this.log('API wait timeout:', error);
        reject(error);
        return;
      }

      setTimeout(checkAPI, 100);
    };

    checkAPI();
  }

  /**
   * デバッグログ出力
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.options.debug) {
      console.log(`[TwitterService] ${message}`, ...args);
    }
  }
}

import { TWITTER_EMBED_CONFIG } from '$constants';

// シングルトンインスタンス
export const twitterService = new TwitterService({
  debug: TWITTER_EMBED_CONFIG.debug,
  timeout: TWITTER_EMBED_CONFIG.timeout,
  defaultWidgetOptions: TWITTER_EMBED_CONFIG.defaultOptions,
});

export default twitterService;
