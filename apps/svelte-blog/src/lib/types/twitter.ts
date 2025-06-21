/**
 * Twitter Widget API型定義
 * Twitter for Websites - Widget API の完全な型定義
 */

export interface TwitterWidgetOptions {
  /** ウィジェットのテーマ設定 */
  theme?: 'light' | 'dark';
  /** ウィジェットの幅 */
  width?: string | number;
  /** ウィジェットの高さ */
  height?: string | number;
  /** DNT (Do Not Track) 設定 */
  dnt?: boolean;
  /** 会話表示の設定 */
  conversation?: 'none' | 'all';
  /** 言語設定 */
  lang?: string;
  /** リンクカラー */
  linkColor?: string;
  /** ボーダーカラー */
  borderColor?: string;
}

export interface TwitterTimelineOptions extends TwitterWidgetOptions {
  /** 表示するツイート数 */
  tweetLimit?: number;
  /** リツイートを表示するか */
  showReplies?: boolean;
  /** Chrome (header) を表示するか */
  chrome?: string[];
}

export interface TwitterWidgets {
  /**
   * ページ内のすべてのTwitterウィジェットを読み込み/再読み込み
   */
  load(element?: HTMLElement): Promise<void>;

  /**
   * 単一のツイートを埋め込み
   */
  createTweet(
    tweetId: string,
    container: HTMLElement,
    options?: TwitterWidgetOptions
  ): Promise<HTMLElement>;

  /**
   * タイムラインを埋め込み
   */
  createTimeline(
    source: { sourceType: string; screenName?: string; userId?: string },
    container: HTMLElement,
    options?: TwitterTimelineOptions
  ): Promise<HTMLElement>;

  /**
   * フォローボタンを埋め込み
   */
  createFollowButton(
    screenName: string,
    container: HTMLElement,
    options?: TwitterWidgetOptions
  ): Promise<HTMLElement>;
}

export interface TwitterEvents {
  /** ウィジェットが読み込まれたときに呼ばれる */
  bind(event: 'loaded', callback: (event: unknown) => void): void;
  /** ツイートがレンダリングされたときに呼ばれる */
  bind(event: 'rendered', callback: (event: unknown) => void): void;
  /** ウィジェット内でリンクがクリックされたときに呼ばれる */
  bind(event: 'click', callback: (event: unknown) => void): void;
}

export interface TwitterAPI {
  /** ウィジェット関連のAPI */
  widgets: TwitterWidgets;
  /** イベント関連のAPI */
  events: TwitterEvents;
  /** TwitterのAPIが準備完了時に呼び出されるコールバック */
  ready(callback: () => void): void;
}

declare global {
  interface Window {
    twttr?: TwitterAPI;
  }
}

export type TwitterEmbedState = 'idle' | 'loading' | 'loaded' | 'error';

export interface TwitterServiceOptions {
  /** スクリプト読み込みのタイムアウト時間（ミリ秒） */
  timeout?: number;
  /** デバッグログを有効にするか */
  debug?: boolean;
  /** デフォルトのウィジェットオプション */
  defaultWidgetOptions?: TwitterWidgetOptions;
}
