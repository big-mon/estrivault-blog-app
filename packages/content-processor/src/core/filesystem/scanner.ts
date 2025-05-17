import { glob } from 'glob';
import { FileSystemLoader } from './loader';

/**
 * ファイルシステムをスキャンするクラス
 */
export class FileScanner {
  constructor(private readonly loader: FileSystemLoader = new FileSystemLoader()) {}

  /**
   * 指定されたパターンに一致するファイルを検索する
   * @param patterns 検索するパターン（文字列または文字列の配列）
   * @param options 検索オプション
   * @returns 見つかったファイルのパスの配列
   */
  async findFiles(
    patterns: string | string[],
    options: {
      cwd?: string;
      absolute?: boolean;
      ignore?: string | string[];
      nodir?: boolean;
    } = {}
  ): Promise<string[]> {
    const {
      cwd = process.cwd(),
      absolute = true,
      ignore = ['**/node_modules/**'],
      nodir = true
    } = options;

    const files = await glob(patterns, {
      cwd,
      absolute,
      ignore,
      nodir
    });

    return files;
  }

  /**
   * ディレクトリ内のMarkdownファイルを再帰的に検索する
   * @param dirPath 検索するディレクトリのパス
   * @param recursive 再帰的に検索するかどうか
   * @returns 見つかったMarkdownファイルのパスの配列
   */
  async findMarkdownFiles(
    dirPath: string,
    recursive: boolean = true
  ): Promise<string[]> {
    const pattern = recursive ? '**/*.md' : '*.md';
    return this.findFiles(pattern, { cwd: dirPath });
  }

  /**
   * 指定されたディレクトリ内のファイルをフィルタリングする
   * @param dirPath 検索するディレクトリのパス
   * @param filterFn フィルタ関数
   * @returns フィルタリングされたファイルのパスの配列
   */
  async filterFiles(
    dirPath: string,
    filterFn: (filePath: string) => boolean | Promise<boolean>
  ): Promise<string[]> {
    const files = await this.findFiles('**/*', { cwd: dirPath });
    const results = await Promise.all(
      files.map(async (file) => ({
        path: file,
        match: await filterFn(file)
      }))
    );
    return results.filter((r) => r.match).map((r) => r.path);
  }
}
