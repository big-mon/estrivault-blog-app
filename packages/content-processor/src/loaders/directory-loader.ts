import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { FileNotFoundError } from '../errors';
import type { DirectoryLoaderResult, ListOptions, ProcessorOptions } from '../types';
import { loadDirectory } from './load-directory';

/**
 * プロジェクトルートからの相対パス
 */
const CONTENT_DIR = path.resolve(process.cwd(), '../../content/blog');
console.log('CONTENT_DIR:', CONTENT_DIR);

/**
 * デフォルトのファイルパターン
 */
const DEFAULT_PATTERN = '**/*.{md,mdx}';

/**
 * 記事一覧を取得
 */
export async function getPosts(options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}) {
  try {
    const page = options.page || 1;
    const perPage = options.perPage || 20;
    const allPosts = await loadDirectory({
      ...options,
      pattern: DEFAULT_PATTERN,
    });
    const filteredPosts = allPosts.filter((post) => !post.meta.draft);
    const paginatedPosts = filteredPosts.slice((page - 1) * perPage, page * perPage);
    return {
      posts: paginatedPosts,
      total: filteredPosts.length, // フィルタリング後の全件数を返す
      page,
      perPage,
      totalPages: Math.ceil(filteredPosts.length / perPage),
    };
  } catch (err) {
    console.error('Failed to get posts:', err);
    throw new Error('Failed to get posts');
  }
}

/**
 * スラッグに基づいて個別の記事を取得
 * @param slug 記事のスラッグ
 * @returns 記事のメタデータとHTMLコンテンツ
 */
export async function getPostBySlug(
  slug: string,
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
): Promise<DirectoryLoaderResult> {
  // 調査用: slug比較ログ
  console.log('getPostBySlug called with:', slug);

  // 正しいfilterを適用
  const posts = await loadDirectory({
    ...options,
    filter: (post) => !post.meta.draft && post.meta.slug === slug,
  });

  // フィルタリング済みの最初の記事を取得
  console.log('filtered posts:', posts.map(p => p.meta.slug));
  console.log('filtered posts (full object):', posts);
  const post = posts[0];
  if (!post) {
    throw new FileNotFoundError(`File not found with slug: ${slug}`);
  }
  return post;
}

/**
 * タグに基づいて記事を取得
 * @param tag タグのスラッグ
 * @returns タグに一致する記事のメタデータの配列
 */
export async function getPostsByTag(
  tag: string,
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
) {
  try {
    const allPosts = await loadDirectory({
      ...options,
      pattern: DEFAULT_PATTERN,
    });
    const filteredPosts = allPosts.filter(
      (post) => !post.meta.draft && Array.isArray(post.meta.tags) && post.meta.tags.includes(tag)
    );
    return filteredPosts;
  } catch (err) {
    console.error('Failed to get posts by tag:', err);
    throw new Error('Failed to get posts by tag');
  }
}
