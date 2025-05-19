import { getAllPosts, getPostBySlug as getPostContent, type PostMeta, type PostHTML } from '@estrivault/content-processor';
import path from 'path';
import { PUBLIC_CLOUDINARY_CLOUD_NAME as cloudNameFromEnv } from '$env/static/public';

// コンテンツディレクトリのパス
const CONTENT_DIR = path.resolve(process.cwd(), '../../content/blog');

/**
 * すべての記事メタデータを取得
 */
export async function getPosts(options?: {
  page?: number;
  perPage?: number;
  sort?: 'publishedAt' | 'title';
  includeDrafts?: boolean;
  category?: string;
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
    const sort = options?.sort || 'publishedAt';
    const includeDrafts = options?.includeDrafts || false;

    // フィルター関数
    const filter = (post: PostMeta) => {
      // 下書きを除外（includeDraftsがtrueの場合は含める）
      if (!includeDrafts && post.draft) {
        return false;
      }
      // カテゴリーが指定されている場合はフィルタリング（大文字小文字を区別しない）
      if (options?.category && post.category?.toLowerCase() !== options.category.toLowerCase()) {
        return false;
      }
      return true;
    };

    // 記事一覧を取得（サブディレクトリも再帰的に検索）
    const allPosts = await getAllPosts([`${CONTENT_DIR}/**/*.md`, `${CONTENT_DIR}/**/*.mdx`], {
      page,
      perPage,
      sort,
      filter,
      cloudinaryCloudName: cloudNameFromEnv,
    });

    // Postインターフェースに変換
    const posts = allPosts.map((post) => ({
      ...post,
    }));

    return {
      posts,
      total: posts.length,
      page,
      perPage,
      totalPages: Math.ceil(posts.length / perPage),
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
    // 記事のHTMLコンテンツを取得（baseDir とオプションを分けて渡す）
    const post = await getPostContent(slug, CONTENT_DIR, {
      cloudinaryCloudName: cloudNameFromEnv,
    });

    if (!post) {
      return null;
    }

    return post;
  } catch (err) {
    console.error('記事の取得中にエラーが発生しました:', err);
    throw new Error('記事の取得中にエラーが発生しました');
  }
}
