export class FrontMatterError extends Error {
  constructor(message?: string) {
    super(message || 'Front-matterの形式が不正です');
    this.name = 'FrontMatterError';
  }
}

export class MarkdownParseError extends Error {
  constructor(message?: string) {
    super(message || 'Markdownのパースに失敗しました');
    this.name = 'MarkdownParseError';
  }
}
