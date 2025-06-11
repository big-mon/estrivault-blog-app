import {
  getPosts as getPostsFromProcessor,
  getPostBySlug as getPostBySlugFromProcessor,
  getPostsByTag as getPostsByTagFromProcessor,
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

    // content-processor側でフィルタされるため、ここでのfilter処理は不要
    const allPostsObj = await getPostsFromProcessor({
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
      page,
      perPage,
      category: options?.category,
      tag: options?.tag,
    });

    return allPostsObj;
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
  const post = await getPostBySlugFromProcessor(slug, {
    cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
  return post;
}

/**
 * タグに基づいて記事を取得
 * @param tag タグのスラッグ
 * @returns タグに一致する記事のメタデータの配列
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const items = await getPostsByTagFromProcessor(tag, {
    cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
  return items;
}
