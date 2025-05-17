/**
 * ファイルが見つからない場合のエラー
 */
export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileNotFoundError';
  }
}

/**
 * Front-matterの形式が不正な場合のエラー
 */
export class FrontMatterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrontMatterError';
  }
}

/**
 * Markdownのパースに失敗した場合のエラー
 */
export class MarkdownParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarkdownParseError';
  }
}
