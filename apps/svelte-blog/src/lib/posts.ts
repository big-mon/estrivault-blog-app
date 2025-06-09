import {
  getAllPosts,
  getPostBySlug as getPostBySlugFromProcessor,
  type PostMeta,
  type PostHTML,
} from '@estrivault/content-processor';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

/**
 * すべての記事メタデータを取得
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

    // フィルター関数
    const filter = (post: PostMeta) => {
      // カテゴリーが指定されている場合はフィルタリング（大文字小文字を区別しない）
      if (options?.category && post.category?.toLowerCase() !== options.category.toLowerCase()) {
        return false;
      }
      // タグが指定されている場合はフィルタリング（大文字小文字を区別せず、前後の空白も無視）
      if (options?.tag) {
        const targetTag = normalizeTag(options.tag);
        return post.tags?.some((tag) => normalizeTag(tag) === targetTag) ?? false;
      }
      return true;
    };

    // 記事一覧を取得
    const allPosts = await getAllPosts({
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME
    });

    // フィルタリングとソートを適用
    const filteredPosts = allPosts.filter(filter);

    // ページネーションを適用
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedPosts = filteredPosts.slice(start, end);

    // Postインターフェースに変換
    const posts = paginatedPosts.map((post) => ({
      ...post,
    }));

    return {
      posts,
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
export async function getPostBySlug(slug: string): Promise<PostHTML | null> {
  try {
    const post = await getPostBySlugFromProcessor(slug, {
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME
    });
    return post;
  } catch (err) {
    console.error('記事の取得中にエラーが発生しました:', err);
    return null;
  }
}

/**
 * タグを正規化する
 * - 前後の空白を削除
 * - 大文字小文字を統一（小文字に変換）
 */
function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

/**
 * すべてのユニークなタグを取得
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const allPosts = await getAllPosts({
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
    });

    const tags = new Set<string>();

    allPosts.forEach((post) => {
      // PostMeta 型に直接 tags プロパティがあると仮定
      const postWithTags = post as PostMeta & { tags?: string[] };
      if (postWithTags.tags && Array.isArray(postWithTags.tags)) {
        postWithTags.tags.map((tag) => normalizeTag(tag)).forEach((tag) => tags.add(tag));
      }
    });

    // アルファベット順にソートして返す
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error('Failed to get all tags:', err);
    return [];
  }
}
