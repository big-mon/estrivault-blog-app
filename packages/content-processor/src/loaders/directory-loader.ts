import path from 'path';
import fs from 'node:fs';
import matter from 'gray-matter';
import type { DirectoryLoaderResult, ListOptions, ProcessorOptions } from '../types';
import type { PostMeta } from '../types/post';

/**
 * 記事一覧を取得
 */
export async function getPosts(
  options: ProcessorOptions & ListOptions<DirectoryLoaderResult> = {}
) {
  try {
    const page = options.page || 1;
    const perPage = options.perPage || 20;
    const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
    const posts: PostMeta[] = [];

    // 再帰的にmdファイルを探索
    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
          const raw = fs.readFileSync(fullPath, 'utf-8');
          const { data } = matter(raw);
          if (data.draft) continue;
          if (!data.title || !data.slug || !data.publishedAt) continue;
          const post = {
            title: data.title,
            slug: data.slug,
            description: data.description || '',
            coverImage: data.coverImage || '',
            category: data.category || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            publishedAt: data.publishedAt,
            updatedAt: data.updatedAt,
            readingTime: data.readingTime,
          };
          posts.push(post);
        }
      }
    }
    walk(baseDir);

    // 並び替え（新しい順）
    posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    const filteredPosts = posts; // 追加のフィルタがあればここで適用
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
  options: ProcessorOptions & ListOptions = {}
): Promise<PostMeta> {
  const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
  let found: PostMeta | undefined = undefined;
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const { data } = matter(raw);
        if (data.draft) continue;
        if (!data.title || !data.slug || !data.publishedAt) continue;
        if (data.slug === slug) {
          found = {
            title: data.title,
            slug: data.slug,
            description: data.description || '',
            coverImage: data.coverImage || '',
            category: data.category || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            publishedAt: data.publishedAt,
            updatedAt: data.updatedAt,
            readingTime: data.readingTime,
          };
          return;
        }
      }
    }
  }
  walk(baseDir);
  if (!found) {
    throw new Error(`記事が見つかりませんでした: slug=${slug}`);
  }
  return found;
}

/**
 * タグに基づいて記事を取得
 * @param tag タグのスラッグ
 * @returns タグに一致する記事のメタデータの配列
 */
export async function getPostsByTag(
  tag: string,
  options: ProcessorOptions & ListOptions = {}
): Promise<PostMeta[]> {
  const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
  const posts: PostMeta[] = [];
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const { data } = matter(raw);
        if (data.draft) continue;
        if (!data.title || !data.slug || !data.publishedAt) continue;
        if (Array.isArray(data.tags) && data.tags.includes(tag)) {
          posts.push({
            title: data.title,
            slug: data.slug,
            description: data.description || '',
            coverImage: data.coverImage || '',
            category: data.category || '',
            tags: data.tags,
            publishedAt: data.publishedAt,
            updatedAt: data.updatedAt,
            readingTime: data.readingTime,
          });
        }
      }
    }
  }
  walk(baseDir);
  // 新しい順にソート
  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return posts;
}
