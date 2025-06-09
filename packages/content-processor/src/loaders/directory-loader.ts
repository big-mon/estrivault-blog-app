import { glob } from 'glob';
import path from 'path';
import type { PostMeta, PostHTML, ProcessorOptions } from '../types';
import type { ListOptions } from '../types/core/options';
import { loadFile } from './file-loader';
import { FileNotFoundError } from '../types/errors/file-errors';

/**
 * コンテンツディレクトリのパス
 * プロジェクトルートからの相対パス
 */
const CONTENT_DIR = path.resolve(process.cwd(), '../../content/blog');

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
export async function loadDirectory(
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
 * タグを正規化する
 * - 前後の空白を削除
 * - 大文字小文字を統一（小文字に変換）
 */
export function normalizeTag(tag: string, filePath?: string): string {
  if (typeof tag !== 'string') {
    console.error('Invalid tag type:', { tag, type: typeof tag, filePath });
    throw new Error(`Tag must be a string, got ${typeof tag} in file: ${filePath}`);
  }
  return tag.trim().toLowerCase();
}

/**
 * タグをURLセーフな形式に変換する
 * - スペースをハイフンに置換
 * - 特殊文字を削除
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 英数字、ハイフン、アンダースコア、スペース以外を削除
    .trim()
    .replace(/\s+/g, '-') // スペースをハイフンに置換
    .replace(/-+/g, '-'); // 連続するハイフンを1つに
}

/**
 * タグで記事をフィルタリングする
 */
export async function getPostsByTag(
  tag: string,
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
): Promise<PostMeta[]> {
  const normalizedTag = normalizeTag(tag);
  const posts = await loadDirectory({
    ...options,
    filter: (post) => {
      if (post.meta.draft) return false;
      // タグが文字列の配列であることを確認
      if (!Array.isArray(post.meta.tags)) return false;
      return post.meta.tags.some((t) => {
        // タグが文字列でない場合はスキップ
        if (typeof t !== 'string') return false;
        return normalizeTag(t, post.path) === normalizedTag;
      });
    },
  });

  return sortPostsByDate(posts).map((post) => post.meta);
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
