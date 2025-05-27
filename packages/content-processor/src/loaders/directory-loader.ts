import fg from 'fast-glob';
import type { PostMeta, PostHTML, ProcessorOptions, ListOptions } from '../types';
import { loadFile } from './file-loader';
import { FileNotFoundError } from '../types/errors/file-errors';

export interface DirectoryLoaderOptions extends ProcessorOptions, ListOptions {
  /**
   * 検索対象のディレクトリ
   * @default process.cwd()
   */
  cwd?: string;

  /**
   * ファイルパターン
   * @default '**\/*.{md,mdx}'
   */
  pattern?: string;

  /**
   * 無視するディレクトリパターン
   * @default ['node_modules', '.git', 'dist', 'build']
   */
  ignore?: string[];

  /**
   * 再帰的に検索するか
   * @default true
   */
  recursive?: boolean;
}

export interface DirectoryLoaderResult extends PostHTML {
  /** ファイルパス */
  path: string;
}

/**
 * ディレクトリからマークダウンファイルを検索して読み込む
 * @param options オプション
 * @returns 読み込まれたコンテンツとメタデータの配列
 */
export async function loadDirectory(
  options: DirectoryLoaderOptions = {}
): Promise<DirectoryLoaderResult[]> {
  const {
    cwd = process.cwd(),
    pattern = '**/*.{md,mdx}',
    ignore = ['node_modules', '.git', 'dist', 'build'],
    recursive = true,
    ...processorOptions
  } = options;

  // ファイルの検索
  const files = await fg(pattern, {
    cwd,
    ignore,
    onlyFiles: true,
    absolute: false,
    caseSensitiveMatch: false,
    dot: false,
    unique: true,
    followSymbolicLinks: false,
    deep: recursive ? undefined : 1,
  });

  // ファイルの読み込み
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const result = await loadFile(file, { cwd, ...processorOptions });
      return {
        ...result,
        path: file,
      };
    })
  );

  // エラーを無視して成功した結果のみを返す
  return results
    .filter(
      (result): result is PromiseFulfilledResult<DirectoryLoaderResult> =>
        result.status === 'fulfilled'
    )
    .map((result) => result.value);
}

/**
 * スラッグで記事を検索する
 * @param slug 検索するスラッグ
 * @param options オプション
 * @returns 見つかった記事のコンテンツとメタデータ
 * @throws {FileNotFoundError} 記事が見つからない場合
 */
export async function findPostBySlug(
  slug: string,
  options: Omit<DirectoryLoaderOptions, 'pattern'> = {}
): Promise<DirectoryLoaderResult> {
  const posts = await loadDirectory({
    ...options,
    pattern: '**/*.{md,mdx}',
  });

  // スラッグが完全一致する記事を検索
  const post = posts.find((post) => post.meta.slug === slug);
  if (!post) {
    throw new FileNotFoundError(`File not found with slug: ${slug}`);
  }
  return post;
}

/**
 * 指定されたパターンに一致するMarkdownファイルからメタデータ一覧を取得
 * @param globPattern globパターン（単一または配列）
 * @param options オプション
 * @returns メタデータ一覧
 */
export async function getAllPosts(
  globPattern: string | string[],
  options: Omit<DirectoryLoaderOptions, 'pattern'> = {}
): Promise<PostMeta[]> {
  const {
    cwd = process.cwd(),
    ignore = [
      '**/node_modules/**',
      '**/.git/**',
      '**/.svelte-kit/**',
      '**/build/**',
      '**/.vercel/**',
      '**/.netlify/**',
    ],
    recursive = true,
    page = 1,
    perPage = 20,
    sort = 'publishedAt',
    filter = () => true,
    includeDrafts = false,
  } = options;

  const patterns = Array.isArray(globPattern) ? globPattern : [globPattern];

  const posts = await Promise.all(
    patterns.map((pattern) =>
      loadDirectory({
        ...options,
        pattern,
      })
    )
  );

  // 結果をフラット化
  const allPosts = posts.flat();

  // メタデータに変換してからフィルタリング
  const postMetas = allPosts.map((post) => ({
    meta: {
      ...post.meta,
      // 必要に応じて追加のメタデータをマッピング
    },
  }));

  // ドラフトを除外
  const publishedPosts = includeDrafts ? postMetas : postMetas.filter((post) => !post.meta?.draft);

  // カスタムフィルタを適用
  const filteredPosts = publishedPosts.filter((post) => filter(post.meta));

  // ソート
  const sortedPosts =
    sort === 'title'
      ? [...filteredPosts].sort((a, b) => a.meta.title.localeCompare(b.meta.title))
      : sortPostsByDate(filteredPosts, sort === 'publishedAt' ? 'desc' : 'asc');

  // ページネーション
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  return sortedPosts.slice(startIndex, endIndex).map((post) => post.meta);
}

/**
 * 指定されたslugに一致するMarkdownファイルを処理してHTMLとメタデータを返す
 * @param slug ファイル名（拡張子なし）
 * @param baseDir 基準ディレクトリ
 * @param options 処理オプション
 * @returns HTML文字列とメタデータ
 */
export async function getPostBySlug(
  slug: string,
  baseDir: string,
  options: ProcessorOptions = {}
): Promise<PostHTML> {
  return findPostBySlug(slug, {
    ...options,
    cwd: baseDir,
  });
}

/**
 * ポストを公開日でソートする
 * @param posts ソートするポストの配列
 * @param order ソート順 ('asc' | 'desc')
 * @returns ソートされたポストの配列
 */
export function sortPostsByDate<T extends { meta: { publishedAt: string } }>(
  posts: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.meta.publishedAt).getTime();
    const dateB = new Date(b.meta.publishedAt).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * ポストをフィルタリングする
 * @param posts フィルタリングするポストの配列
 * @param predicate フィルタリング関数
 * @returns フィルタリングされたポストの配列
 */
export function filterPosts<T>(posts: T[], predicate: (post: T) => boolean): T[] {
  return posts.filter(predicate);
}
