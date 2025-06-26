import { getAllPostsMetaStatic } from './file-utils';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

/**
 * プリレンダリング用の全記事パスを生成
 * @returns 全記事のパス配列
 */
export async function getAllPostPaths(): Promise<string[]> {
  try {
    const processorOptions = {
      cloudinaryCloudName: PUBLIC_CLOUDINARY_CLOUD_NAME,
    };

    const allPosts = await getAllPostsMetaStatic(processorOptions);

    return allPosts.map((post) => `/post/${post.slug}`);
  } catch (err) {
    console.error('Failed to generate post paths for prerendering:', err);
    return [];
  }
}
