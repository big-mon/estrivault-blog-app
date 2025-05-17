import { AppError } from './base-error';
import { ErrorCodes } from './error-codes';

/**
 * 設定の検証に失敗した場合のエラー
 */
export class ConfigValidationError extends AppError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(
      `設定の検証に失敗しました: ${message}`,
      ErrorCodes.CONFIG_VALIDATION_ERROR,
      {
        ...options,
        context: {
          validationTarget: 'config',
          ...options.context
        }
      }
    );
  }
}

/**
 * 必須の設定が不足している場合のエラー
 */
export class MissingConfigError extends ConfigValidationError {
  constructor(
    configKey: string,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(
      `必須の設定が不足しています: ${configKey}`,
      {
        ...options,
        context: {
          missingKey: configKey,
          ...options.context
        }
      }
    );
  }
}
