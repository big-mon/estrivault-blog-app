import { AppError } from './base-error';
import { ErrorCodes } from './error-codes';

/**
 * ファイルが見つからない場合のエラー
 */
export class FileNotFoundError extends AppError {
  constructor(
    filePath: string,
    options: { cause?: Error } = {}
  ) {
    super(
      `ファイルが見つかりません: ${filePath}`,
      ErrorCodes.FILE_NOT_FOUND,
      {
        ...options,
        context: { filePath }
      }
    );
  }
}

/**
 * ファイルの読み込みに失敗した場合のエラー
 */
export class FileReadError extends AppError {
  constructor(
    filePath: string,
    options: { cause?: Error } = {}
  ) {
    super(
      `ファイルの読み込みに失敗しました: ${filePath}`,
      ErrorCodes.FILE_READ_ERROR,
      {
        ...options,
        context: { filePath }
      }
    );
  }
}

/**
 * ファイルの書き込みに失敗した場合のエラー
 */
export class FileWriteError extends AppError {
  constructor(
    filePath: string,
    options: { cause?: Error } = {}
  ) {
    super(
      `ファイルの書き込みに失敗しました: ${filePath}`,
      ErrorCodes.FILE_WRITE_ERROR,
      {
        ...options,
        context: { filePath }
      }
    );
  }
}
