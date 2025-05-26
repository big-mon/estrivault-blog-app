import { getPostBySlug } from '$lib/posts';
import { error } from '@sveltejs/kit';
import type { PostHTML } from '@estrivault/content-processor';

export const load = async ({ params }: { params: { slug: string } }): Promise<{ post: PostHTML }> => {
  try {
    const { slug } = params;
    
    if (!slug) {
      throw error(404, '記事が見つかりません');
    }
    const post = await getPostBySlug(slug);

    if (!post) {
      throw error(404, '記事が見つかりません');
    }

    return {
      post,
    };
  } catch (err) {
    console.error('記事の読み込み中にエラーが発生しました:', err);
    throw error(500, '記事の読み込み中にエラーが発生しました');
  }
};
