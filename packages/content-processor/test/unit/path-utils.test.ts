import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  resolvePath,
  getBaseNameWithoutExtension,
  generateSlugFromPath,
  getDirname
} from '../../src/utils/path-utils';

/**
 * パス関連のユーティリティ関数のテスト
 */
describe('path-utils', () => {
  /**
   * resolvePath 関数のテスト
   * パス解決の動作を検証する
   */
  describe('resolvePath', () => {
    // 相対パスがベースディレクトリを基準に正しく解決されること
    it('ベースディレクトリを基準に相対パスを解決できること', () => {
      const result = resolvePath('/base/dir', './test.md');
      expect(result).toMatch(/[\\/]base[\\/]dir[\\/]test\.md$/);
    });

    // 絶対パスがそのまま返されること（変更されないこと）
    it('絶対パスがそのまま返されること', () => {
      // プラットフォームに応じた絶対パスを生成
      const absolutePath = process.platform === 'win32'
        ? 'C:\\absolute\\path\\test.md'
        : '/absolute/path/test.md';
      const result = resolvePath('/base/dir', absolutePath);
      expect(result).toBe(absolutePath);
    });
  });

  /**
   * getBaseNameWithoutExtension 関数のテスト
   * ファイル名から拡張子を除去する機能を検証する
   */
  describe('getBaseNameWithoutExtension', () => {
    // 通常のファイル名から拡張子が正しく除去されること
    it('通常のファイル名から拡張子が除去されること', () => {
      const result = getBaseNameWithoutExtension('test.md');
      expect(result).toBe('test');
    });

    // 複数のドットを含むファイル名の場合、最後の拡張子のみが除去されること
    it('複数のドットを含むファイル名から最後の拡張子のみが除去されること', () => {
      const result = getBaseNameWithoutExtension('test.file.md');
      expect(result).toBe('test.file');
    });

    // 拡張子がない場合は元の名前がそのまま返されること
    it('拡張子がない場合は元の名前がそのまま返されること', () => {
      const result = getBaseNameWithoutExtension('test');
      expect(result).toBe('test');
    });
  });

  /**
   * generateSlugFromPath 関数のテスト
   * ファイルパスからスラッグを生成する機能を検証する
   */
  describe('generateSlugFromPath', () => {
    // 通常のファイル名から正しくスラッグが生成されること
    it('通常のファイル名から正しくスラッグが生成されること', () => {
      const result = generateSlugFromPath('test-file.md');
      expect(result).toBe('test-file');
    });

    // 大文字を含むファイル名は小文字に変換されること
    it('大文字を含むファイル名は小文字に変換されること', () => {
      const result = generateSlugFromPath('Test-File.md');
      expect(result).toBe('test-file');
    });

    // 特殊文字がハイフンに置換されること
    it('特殊文字がハイフンに置換されること', () => {
      const result = generateSlugFromPath('test#file@name.md');
      expect(result).toBe('test-file-name');
    });

    // 連続するハイフンが1つにまとめられること
    it('連続するハイフンが1つにまとめられること', () => {
      const result = generateSlugFromPath('test--file---name.md');
      expect(result).toBe('test-file-name');
    });

    // 先頭と末尾のハイフンが除去されること
    it('先頭と末尾のハイフンが除去されること', () => {
      const result = generateSlugFromPath('-test-file-name-');
      expect(result).toBe('test-file-name');
    });
  });

  /**
   * getDirname 関数のテスト
   * import.meta からディレクトリパスを取得する機能を検証する
   */
  describe('getDirname', () => {
    it('import.meta から正しくディレクトリパスを取得できること', () => {
      // プラットフォームに依存しないファイルURLを準備
      const mockFileUrl = process.platform === 'win32'
        ? 'file:///C:/path/to/module.ts'
        : 'file:///path/to/module.ts';

      // import.meta オブジェクトのモックを作成
      const mockMeta = {
        url: mockFileUrl
      } as unknown as ImportMeta;

      // 期待される結果を計算
      const expectedDirname = path.dirname(fileURLToPath(mockFileUrl));

      // テスト実行
      const result = getDirname(mockMeta);

      // 検証
      expect(result).toBe(expectedDirname);
    });

    it('URL が undefined の場合はエラーをスローすること', () => {
      // テスト用のモックオブジェクトを作成
      const mockMeta = { url: undefined } as unknown as ImportMeta;

      // エラーがスローされることを検証
      // Node.js の fileURLToPath 関数は URL が undefined の場合、
      // "The \"path\" argument must be of type string or an instance of URL. Received undefined" というエラーをスローする
      expect(() => getDirname(mockMeta)).toThrowError(
        /The "path" argument must be of type string or an instance of URL/
      );
    });
  });
});
