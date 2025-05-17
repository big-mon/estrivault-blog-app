import fs from 'fs/promises';
import path from 'path';
import { FileNotFoundError } from '../../types/errors';

/**
 * ファイルシステム操作を行うクラス
 */
export class FileSystemLoader {
  /**
   * ファイルを読み込む
   * @param filePath 読み込むファイルのパス
   * @returns ファイルの内容
   * @throws {FileNotFoundError} ファイルが見つからない場合
   */
  async loadFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new FileNotFoundError(`ファイルが見つかりません: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * ファイルに保存する
   * @param filePath 保存先のファイルパス
   * @param content 保存する内容
   */
  async saveFile(filePath: string, content: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * ファイルが存在するか確認する
   * @param filePath 確認するファイルのパス
   * @returns ファイルが存在する場合はtrue、それ以外はfalse
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
