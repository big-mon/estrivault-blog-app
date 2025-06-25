import { normalizeForTagFilter, type PostMeta, type PostHTML } from '@estrivault/content-processor';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
import { getAllPostsMetaStatic, getPostBySlugStatic } from './file-utils';

// 設定オプション（import.meta.globではbaseDirは不要）
const processorOptions = {
  cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
};

/**
 * すべての記事メタデータを取得
 * @returns 記事のメタデータの配列
 * @param options ページネーションやフィルタリングのオプション
 * @param options.page ページ番号（デフォルトは1）
 * @param options.perPage 1ページあたりの記事数（デフォルトは20）
 * @param options.category カテゴリでフィルタリング
 * @param options.tag タグでフィルタリング
 */
export async function getPosts(options?: {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
}): Promise<{
  posts: PostMeta[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}> {
  try {
    // デフォルトオプション
    const page = options?.page || 1;
    const perPage = options?.perPage || 20;

    // 全記事を取得（静的版）
    const allPosts = await getAllPostsMetaStatic(processorOptions);

    // カテゴリやタグでフィルタリング
    let filteredPosts = allPosts;
    if (options?.category) {
      const normalizedCategory = normalizeForTagFilter(options.category);
      filteredPosts = filteredPosts.filter(
        (post: PostMeta) => normalizeForTagFilter(post.category) === normalizedCategory,
      );
    }
    if (options?.tag) {
      const normalizedTag = normalizeForTagFilter(options.tag);
      filteredPosts = filteredPosts.filter((post: PostMeta) =>
        post.tags?.some((tag: string) => normalizeForTagFilter(tag) === normalizedTag),
      );
    }

    // ページネーション処理
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;
    const posts = filteredPosts.slice(startIndex, startIndex + perPage);

    const result = {
      posts,
      total,
      page,
      perPage,
      totalPages,
    };

    return result;
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
export async function getPostBySlug(slug: string): Promise<PostHTML> {
  const post = await getPostBySlugStatic(slug, processorOptions);

  if (!post) {
    throw new Error(`Post with slug '${slug}' not found`);
  }

  return post;
}
