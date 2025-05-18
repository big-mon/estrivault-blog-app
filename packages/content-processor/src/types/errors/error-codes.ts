/**
 * エラーコードの定数定義
 */
export const ErrorCodes = {
  // ファイル関連のエラー (1000-1999)
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',

  // マークダウン関連のエラー (2000-2999)
  MARKDOWN_PARSE_ERROR: 'MARKDOWN_PARSE_ERROR',
  MARKDOWN_RENDER_ERROR: 'MARKDOWN_RENDER_ERROR',

  // プラグイン関連のエラー (3000-3999)
  PLUGIN_LOAD_ERROR: 'PLUGIN_LOAD_ERROR',
  PLUGIN_EXECUTION_ERROR: 'PLUGIN_EXECUTION_ERROR',

  // 設定関連のエラー (4000-4999)
  CONFIG_VALIDATION_ERROR: 'CONFIG_VALIDATION_ERROR',

  // その他のエラー (5000-5999)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * エラーコードの型定義
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// エクスポートする型
// このファイルを直接インポートすると、ErrorCodes と ErrorCode の両方が利用可能
export type { ErrorCode as default };
