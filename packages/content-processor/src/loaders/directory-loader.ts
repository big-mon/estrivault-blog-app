import { glob } from 'glob';
import path from 'path';
import type { PostMeta, PostHTML, ProcessorOptions } from '../types';
import type { ListOptions } from '../types/core/options';
import { loadFile } from './file-loader';
import { FileNotFoundError } from '../types/errors/file-errors';

/**
 * コンテンツディレクトリのパス
 */
const CONTENT_DIR = path.resolve(process.cwd(), 'content/blog');

/**
 * デフォルトのファイルパターン
 */
const DEFAULT_PATTERN = '**/*.{md,mdx}';

export interface DirectoryLoaderResult extends PostHTML {
  /** ファイルパス */
  path: string;
}

/**
 * ディレクトリからマークダウンファイルを読み込む
 */
async function loadDirectory(
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
): Promise<DirectoryLoaderResult[]> {
  const { ...processorOptions } = options;

  // クライアントサイドでは空配列を返す
  if (typeof window !== 'undefined') {
    return [];
  }

  try {
    // ファイルの検索
    const files = await glob(DEFAULT_PATTERN, {
      cwd: CONTENT_DIR,
      nodir: true,
      absolute: true,
      dot: false,
      follow: false,
    });

    // ファイルの読み込み
    const results = await Promise.all(
      files.map(async (file) => {
        const result = await loadFile(file, { ...processorOptions });
        return { ...result, path: file };
      })
    );

    return results;
  } catch (error) {
    console.error('Error loading directory:', error);
    throw error;
  }
}

/**
 * スラッグで記事を検索する
 */
export async function getPostBySlug(
  slug: string,
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
): Promise<DirectoryLoaderResult> {
  const posts = await loadDirectory({
    ...options,
    filter: (post) => !post.meta.draft && post.meta.slug === slug,
  });

  // フィルタリング済みの最初の記事を取得
  const post = posts[0];
  if (!post) {
    throw new FileNotFoundError(`File not found with slug: ${slug}`);
  }
  return post;
}

/**
 * 公開済みの記事一覧を取得する
 */
export async function getAllPosts(
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
): Promise<PostMeta[]> {
  const posts = await loadDirectory({
    ...options,
    filter: (post) => !post.meta.draft,
  });

  const sortedPosts = sortPostsByDate(posts);
  return sortedPosts.map((post) => post.meta);
}

/**
 * タグで記事をフィルタリングする
 */
export async function getPostsByTag(
  tag: string,
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
): Promise<PostMeta[]> {
  const posts = await loadDirectory({
    ...options,
    filter: (post) => !post.meta.draft && post.meta.tags?.includes(tag),
  });

  const sortedPosts = sortPostsByDate(posts);
  return sortedPosts.map((post) => post.meta);
}

/**
 * 記事を日付でソートする
 */
function sortPostsByDate<T extends { meta: { publishedAt: string } }>(
  posts: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.meta.publishedAt).getTime();
    const dateB = new Date(b.meta.publishedAt).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
