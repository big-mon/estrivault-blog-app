import { AppError } from './base-error';
import { ErrorCodes } from './error-codes';

/**
 * Front-matterの形式が不正な場合のエラー
 */
export class FrontMatterError extends AppError {
  constructor(message: string, options: { cause?: Error; context?: Record<string, unknown> } = {}) {
    super(`Front-matterの形式が不正です: ${message}`, ErrorCodes.VALIDATION_ERROR, {
      ...options,
      context: {
        ...options.context,
        validationTarget: 'frontMatter',
      },
    });
  }
}

/**
 * マークダウンのパースに失敗した場合のエラー
 */
export class MarkdownParseError extends AppError {
  constructor(message: string, options: { cause?: Error; context?: Record<string, unknown> } = {}) {
    super(
      `マークダウンのパースに失敗しました: ${message}`,
      ErrorCodes.MARKDOWN_PARSE_ERROR,
      options
    );
  }
}

/**
 * マークダウンのレンダリングに失敗した場合のエラー
 */
export class MarkdownRenderError extends AppError {
  constructor(message: string, options: { cause?: Error; context?: Record<string, unknown> } = {}) {
    super(
      `マークダウンのレンダリングに失敗しました: ${message}`,
      ErrorCodes.MARKDOWN_RENDER_ERROR,
      options
    );
  }
}
