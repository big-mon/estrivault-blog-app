// content-processor用シンプルエラー集約

export class FileNotFoundError extends Error {
  constructor(message?: string) {
    super(message || 'ファイルが見つかりません');
    this.name = 'FileNotFoundError';
  }
}

export class FileReadError extends Error {
  constructor(message?: string) {
    super(message || 'ファイルの読み込みに失敗しました');
    this.name = 'FileReadError';
  }
}

export class FileWriteError extends Error {
  constructor(message?: string) {
    super(message || 'ファイルの書き込みに失敗しました');
    this.name = 'FileWriteError';
  }
}

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

export class MarkdownRenderError extends Error {
  constructor(message?: string) {
    super(message || 'Markdownのレンダリングに失敗しました');
    this.name = 'MarkdownRenderError';
  }
}

export class PluginLoadError extends Error {
  constructor(message?: string) {
    super(message || 'プラグインの読み込みに失敗しました');
    this.name = 'PluginLoadError';
  }
}

export class PluginExecutionError extends Error {
  constructor(message?: string) {
    super(message || 'プラグインの実行中にエラーが発生しました');
    this.name = 'PluginExecutionError';
  }
}

export class PluginValidationError extends Error {
  constructor(message?: string) {
    super(message || 'プラグインの検証に失敗しました');
    this.name = 'PluginValidationError';
  }
}

export class ConfigValidationError extends Error {
  constructor(message?: string) {
    super(message || '設定の検証に失敗しました');
    this.name = 'ConfigValidationError';
  }
}

export class MissingConfigError extends Error {
  constructor(message?: string) {
    super(message || '必須の設定が不足しています');
    this.name = 'MissingConfigError';
  }
}

export class NotImplementedError extends Error {
  constructor(message?: string) {
    super(message || '未実装の機能です');
    this.name = 'NotImplementedError';
  }
}

export class ValidationError extends Error {
  constructor(message?: string) {
    super(message || '検証エラー');
    this.name = 'ValidationError';
  }
}

export class UnknownError extends Error {
  constructor(message?: string) {
    super(message || '予期せぬエラーが発生しました');
    this.name = 'UnknownError';
  }
}
