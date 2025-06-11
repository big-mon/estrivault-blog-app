import path from 'path';
import fs from 'node:fs';
import type { ProcessorOptions } from '../types';
import type { PostMeta, PostHTML } from '../types/post';
import { loadFile } from './file-loader';

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
    const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
    const posts: PostMeta[] = [];

    // 再帰的にmdファイルを探索
    async function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
          try {
            const { meta } = await loadFile(fullPath, options);
            if (meta.draft) continue;
            posts.push(meta);
          } catch (e) {
            // 無効なファイルはスキップ
            continue;
          }
        }
      }
    }
    await walk(baseDir);

    // 並び替え（新しい順）
    posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

    // category/tag/filter条件で絞り込み
    let filteredPosts = posts;
    // 絞り込み用正規化関数
    // URLセーフなスラッグ化も含む正規化関数
    const normalize = (str: string) =>
      str
        .trim()
        .toLowerCase()
        // 全角英数字→半角
        .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
        // 空白・アンダースコア→ハイフン
        .replace(/[\s_]+/g, '-')
        // 英数字・ハイフン以外除去
        .replace(/[^a-z0-9-]/g, '')
        // 連続ハイフンを1つに
        .replace(/-+/g, '-')
        // 先頭・末尾ハイフン除去
        .replace(/^-+|-+$/g, '');

    if (options.category) {
      filteredPosts = filteredPosts.filter(
        (post) => normalize(post.category) === normalize(options.category!)
      );
    }
    if (options.tag) {
      const tags = Array.isArray(options.tag) ? options.tag : [options.tag];
      filteredPosts = filteredPosts.filter((post) =>
        tags.some((tag) => post.tags.some((t) => normalize(t) === normalize(tag)))
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
  const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
  const posts: PostHTML[] = [];

  // 再帰的にmdファイルを探索
  async function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        try {
          const post = await loadFile(fullPath, options);
          if (post.meta.draft) continue;
          if (post.meta.slug === slug) {
            posts.push(post);
          }
        } catch (e) {
          continue;
        }
      }
    }
  }
  await walk(baseDir);
  return posts[0];
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
  const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
  const posts: PostMeta[] = [];

  // 再帰的にmdファイルを探索
  async function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        try {
          const { meta } = await loadFile(fullPath, options);
          if (meta.draft) continue;
          if (Array.isArray(meta.tags) && meta.tags.includes(tag)) {
            posts.push(meta);
          }
        } catch (e) {
          continue;
        }
      }
    }
  }
  await walk(baseDir);
  // 新しい順にソート
  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return posts;
}
