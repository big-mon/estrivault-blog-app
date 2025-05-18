/**
 * エラーオプションの型定義
 */
export interface ErrorOptions {
  cause?: Error;
  context?: Record<string, unknown>;
}

/**
 * エラーコンテキストの型定義
 */
export type ErrorContext = Record<string, unknown>;

/**
 * アプリケーション全体で使用するベースエラークラス
 */
export class AppError extends Error {
  /**
   * エラーコード
   */
  public readonly code: string;

  /**
   * エラーの原因となった元のエラー
   */
  public readonly cause?: Error;

  /**
   * 追加のコンテキスト情報
   */
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = options.cause;
    this.context = options.context;

    // Error.captureStackTrace が利用可能な環境ではスタックトレースをキャプチャ
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * エラーをJSON形式に変換
   */
  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      ...(this.cause && { cause: this.cause.message }),
      ...(this.context && { context: this.context }),
      stack: this.stack,
    };
  }
}
