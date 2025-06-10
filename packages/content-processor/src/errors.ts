// dummy: 差分生成用コメント
// 仮実装: FileNotFoundError のみエクスポート
export class FileNotFoundError extends Error {
  constructor(message?: string) {
    super(message || 'File not found');
    this.name = 'FileNotFoundError';
  }
}
