import {
  getPosts as getPostsFromProcessor,
  getPostBySlug as getPostBySlugFromProcessor,
  getPostsByTag as getPostsByTagFromProcessor,
  type PostMeta,
  type PostHTML,
} from '@estrivault/content-processor';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
import { loadFile } from '@estrivault/content-processor';

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
        const targetTag = options.tag;
        return post.tags?.some((tag) => tag === targetTag) ?? false;
      }
      return true;
    };

    // 記事一覧を取得
    const allPostsObj = await getPostsFromProcessor({
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
    });

    // DirectoryLoadedItem[] → PostMeta[] へ変換し、フィルタ適用
    const filteredPosts = allPostsObj.posts.map((item) => item.meta).filter(filter);

    // ページネーションを適用
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedPosts = filteredPosts.slice(start, end);

    return {
      posts: filteredPosts, // PostMeta[] 型で返す
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
export async function getPostBySlug(slug: string): Promise<PostHTML | null> {
  try {
    const item = await getPostBySlugFromProcessor(slug, {
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
    if (!item) return null;
    const post = await loadFile(item.filePath, {
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
    return post;
  } catch (err) {
    console.error('記事の取得中にエラーが発生しました:', err);
    return null;
  }
}

/**
 * タグに基づいて記事を取得
 * @param tag タグのスラッグ
 * @returns タグに一致する記事のメタデータの配列
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  return await getPostsByTagFromProcessor(tag, {
    cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
