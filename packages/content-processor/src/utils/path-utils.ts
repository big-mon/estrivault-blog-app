import path from 'path';
import { fileURLToPath } from 'url';

/**
 * ファイルパスから拡張子を除いたベース名を取得
 * @param filePath ファイルパス
 * @returns 拡張子を除いたファイル名
 */
export function getBaseNameWithoutExtension(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * ファイルパスからスラッグを生成
 * @param filePath ファイルパス
 * @returns スラッグ化された文字列
 */
export function generateSlugFromPath(filePath: string): string {
  const baseName = getBaseNameWithoutExtension(filePath);
  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 相対パスを解決
 * @param baseDir 基準ディレクトリ
 * @param relativePath 相対パス
 * @returns 解決された絶対パス
 */
export function resolvePath(baseDir: string, relativePath: string): string {
  // 絶対パスの場合はそのまま返す
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(baseDir, relativePath);
}

/**
 * 現在のモジュールのディレクトリパスを取得
 * @param importMeta import.meta
 * @returns ディレクトリパス
 */
export function getDirname(importMeta: ImportMeta): string {
  const __filename = fileURLToPath(importMeta.url);
  return path.dirname(__filename);
}
