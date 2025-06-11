import { getPostBySlug } from '$lib/posts';
import { error } from '@sveltejs/kit';
import type { PostHTML } from '@estrivault/content-processor';

export const load = async ({
  params,
}: {
  params: { slug: string };
}): Promise<{ post: PostHTML }> => {
  try {
    const { slug } = params;

    const post = await getPostBySlug(slug);

    return {
      post,
    };
  } catch (err) {
    console.error('記事の読み込み中にエラーが発生しました:', err);
    throw error(500, '記事の読み込み中にエラーが発生しました');
  }
};
