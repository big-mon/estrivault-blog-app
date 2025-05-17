import { AppError } from './base-error';
import { ErrorCodes } from './error-codes';

/**
 * プラグインの読み込みに失敗した場合のエラー
 */
export class PluginLoadError extends AppError {
  constructor(
    pluginName: string,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(
      `プラグインの読み込みに失敗しました: ${pluginName}`,
      ErrorCodes.PLUGIN_LOAD_ERROR,
      {
        ...options,
        context: {
          pluginName,
          ...options.context
        }
      }
    );
  }
}

/**
 * プラグインの実行中にエラーが発生した場合のエラー
 */
export class PluginExecutionError extends AppError {
  constructor(
    pluginName: string,
    message: string,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(
      `プラグインの実行中にエラーが発生しました (${pluginName}): ${message}`,
      ErrorCodes.PLUGIN_EXECUTION_ERROR,
      {
        ...options,
        context: {
          pluginName,
          ...options.context
        }
      }
    );
  }
}

/**
 * プラグインの検証に失敗した場合のエラー
 */
export class PluginValidationError extends AppError {
  constructor(
    pluginName: string,
    message: string,
    options: { cause?: Error; context?: Record<string, unknown> } = {}
  ) {
    super(
      `プラグインの検証に失敗しました (${pluginName}): ${message}`,
      ErrorCodes.VALIDATION_ERROR,
      {
        ...options,
        context: {
          pluginName,
          validationTarget: 'plugin',
          ...options.context
        }
      }
    );
  }
}
