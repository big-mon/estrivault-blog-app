import path from 'path';
import fs from 'node:fs';
import type { PostMeta, PostHTML, ProcessorOptions } from '../types';
import { loadFile } from '../loaders/file-loader';

export interface FileWalkOptions extends ProcessorOptions {
  baseDir?: string;
}

export interface PostWithPath {
  meta: PostMeta;
  filePath: string;
}

/**
 * 共通のファイル探索ユーティリティ
 * ディレクトリを再帰的に探索してMarkdownファイルを処理
 */
export async function walkMarkdownFiles(options: FileWalkOptions = {}): Promise<PostMeta[]> {
  const postsWithPath = await walkMarkdownFilesWithPath(options);
  return postsWithPath.map(p => p.meta);
}

/**
 * ファイルパス付きでMarkdownファイルを探索
 */
export async function walkMarkdownFilesWithPath(options: FileWalkOptions = {}): Promise<PostWithPath[]> {
  const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
  const posts: PostWithPath[] = [];

  async function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        try {
          const { meta } = await loadFile(fullPath, options);
          if (!meta.draft) {
            posts.push({ meta, filePath: fullPath });
          }
        } catch (e) {
          // 無効なファイルはスキップ
          continue;
        }
      }
    }
  }

  await walk(baseDir);
  return posts;
}

/**
 * スラッグでファイルを検索してPostHTMLを返す
 */
export async function findPostBySlug(slug: string, options: FileWalkOptions = {}): Promise<PostHTML | null> {
  const postsWithPath = await walkMarkdownFilesWithPath(options);

  for (const { meta, filePath } of postsWithPath) {
    if (meta.slug === slug) {
      try {
        return await loadFile(filePath, options);
      } catch (e) {
        continue;
      }
    }
  }

  return null;
}
