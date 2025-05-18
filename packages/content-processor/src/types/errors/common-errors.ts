import { AppError } from './base-error';
import { ErrorCodes } from './error-codes';

/**
 * 未実装の機能にアクセスした場合のエラー
 */
export class NotImplementedError extends AppError {
  constructor(feature: string, options: { cause?: Error; context?: Record<string, unknown> } = {}) {
    super(`未実装の機能です: ${feature}`, ErrorCodes.NOT_IMPLEMENTED, {
      ...options,
      context: {
        feature,
        ...options.context,
      },
    });
  }
}

/**
 * 検証エラー
 */
export class ValidationError extends AppError {
  constructor(message: string, options: { cause?: Error; context?: Record<string, unknown> } = {}) {
    super(`検証エラー: ${message}`, ErrorCodes.VALIDATION_ERROR, options);
  }
}

/**
 * 予期せぬエラーが発生した場合のエラー
 */
export class UnknownError extends AppError {
  constructor(message: string, options: { cause?: Error; context?: Record<string, unknown> } = {}) {
    super(`予期せぬエラーが発生しました: ${message}`, ErrorCodes.UNKNOWN_ERROR, options);
  }
}
