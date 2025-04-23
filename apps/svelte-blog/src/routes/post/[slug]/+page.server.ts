import { getPost } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const { slug } = params;
  
  if (!slug) {
    throw new Error('Post not found');
  }

  try {
    // 記事データを取得
    const post = await getPost(slug);
    
    return {
      post
    };
  } catch (err) {
    console.error(`Failed to load post with slug ${slug}:`, err);
    throw new Error('Post not found');
  }
}) satisfies PageServerLoad;
