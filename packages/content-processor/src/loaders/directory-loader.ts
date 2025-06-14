import type { ProcessorOptions } from '../types';
import type { PostMeta, PostHTML } from '../types/post';
import { walkMarkdownFiles, findPostBySlug } from '../utils/file-walker';
import { normalizeForTagFilter } from '../utils/normalize';

/**
 * 記事一覧取得用オプション
 */
export interface PostListOptions extends ProcessorOptions {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
  filter?: (post: PostMeta) => boolean;
  baseDir?: string;
}

/**
 * 記事一覧を取得
 */
export async function getPosts(options: PostListOptions = {}) {
  try {
    const page = options.page || 1;
    const perPage = options.perPage || 20;
    const posts = await walkMarkdownFiles(options);

    // 並び替え（新しい順）
    posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

    // category/tag/filter条件で絞り込み
    let filteredPosts = posts;

    if (options.category) {
      filteredPosts = filteredPosts.filter(
        (post) => normalizeForTagFilter(post.category) === normalizeForTagFilter(options.category!)
      );
    }
    if (options.tag) {
      const tags = Array.isArray(options.tag) ? options.tag : [options.tag];
      filteredPosts = filteredPosts.filter((post) =>
        tags.some((tag) => post.tags.some((t) => normalizeForTagFilter(t) === normalizeForTagFilter(tag)))
      );
    }
    if (options.filter) {
      filteredPosts = filteredPosts.filter(options.filter);
    }

    const paginatedPosts = filteredPosts.slice((page - 1) * perPage, page * perPage);
    return {
      posts: paginatedPosts,
      total: filteredPosts.length,
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
  options: PostListOptions = {}
): Promise<PostHTML> {
  const post = await findPostBySlug(slug, options);
  if (!post) {
    throw new Error(`Post not found: ${slug}`);
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
  options: PostListOptions = {}
): Promise<PostMeta[]> {
  const posts = await walkMarkdownFiles(options);

  const filteredPosts = posts.filter(post =>
    Array.isArray(post.tags) && post.tags.some(t => normalizeForTagFilter(t) === normalizeForTagFilter(tag))
  );

  // 新しい順にソート
  filteredPosts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return filteredPosts;
}
