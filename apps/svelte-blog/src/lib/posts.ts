import {
  ContentService,
  type PostMeta,
  type PostHTML,
} from '@estrivault/content-processor';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

// Cloudinaryの設定を持つサービスインスタンスを作成
const contentService = new ContentService({
  cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME
});

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

    // 新しいサービス層APIを使用
    const allPosts = await contentService.getPosts();
    
    // カテゴリやタグでフィルタリング
    let filteredPosts = allPosts;
    if (options?.category) {
      filteredPosts = filteredPosts.filter(post => post.category === options.category);
    }
    if (options?.tag) {
      filteredPosts = filteredPosts.filter(post => post.tags?.includes(options.tag!));
    }
    
    // ページネーション処理
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;
    const posts = filteredPosts.slice(startIndex, startIndex + perPage);
    
    const allPostsObj = {
      posts,
      total,
      page,
      perPage,
      totalPages
    };

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
  const post = await contentService.getPostBySlug(slug);
  if (!post) {
    throw new Error(`Post with slug '${slug}' not found`);
  }
  return post;
}

/**
 * タグに基づいて記事を取得
 * @param tag タグのスラッグ
 * @returns タグに一致する記事のメタデータの配列
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const result = await contentService.getPostsByTag(tag);
  return result.items;
}
