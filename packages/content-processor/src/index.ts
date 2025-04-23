// content-processor public API エントリポイント
import { promises as fs } from 'fs';
import * as path from 'path';
import { markdownToHtmlPipeline } from './pipeline';
import { PostMeta, PostHTML, ProcessorOptions, ListOptions } from './types';

/**
 * Markdown文字列を解析してPostHTMLを返す
 */
export async function loadFromString(
  markdown: string,
  options?: ProcessorOptions
): Promise<PostHTML> {
  return markdownToHtmlPipeline(markdown, options);
}

/**
 * ファイルパスからMarkdownを読み込み、PostHTMLを返す
 */
export async function loadFromFile(
  filePath: string,
  options?: ProcessorOptions
): Promise<PostHTML> {
  const markdown = await fs.readFile(filePath, 'utf-8');
  return markdownToHtmlPipeline(markdown, options);
}

/**
 * ディレクトリ内の全記事のPostMeta配列を返す
 */
export async function getAllPosts(
  dir: string,
  options?: ListOptions & ProcessorOptions
): Promise<PostMeta[]> {
  const files = await fs.readdir(dir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  const posts: PostMeta[] = [];
  for (const file of mdFiles) {
    const fullPath = path.join(dir, file);
    try {
      const { meta } = await loadFromFile(fullPath, options);
      if (!meta.draft) posts.push(meta);
    } catch (e) {
      // 読み込み失敗はスキップ
    }
  }
  // ソート
  if (options?.sort === 'title') {
    posts.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
  // ページネーション
  const page = options?.page || 1;
  const perPage = options?.perPage || 20;
  return posts.slice((page - 1) * perPage, page * perPage);
}

/**
 * slug指定で記事を取得
 */
export async function getPostBySlug(
  dir: string,
  slug: string,
  options?: ProcessorOptions
): Promise<PostHTML | null> {
  const filePath = path.join(dir, slug + '.md');
  try {
    return await loadFromFile(filePath, options);
  } catch {
    return null;
  }
}

export {
  PostMeta,
  PostHTML,
  ProcessorOptions,
  ListOptions,
};
