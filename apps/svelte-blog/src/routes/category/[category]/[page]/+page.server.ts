import { getPosts } from '$lib';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const { category } = params;

  // カテゴリーでフィルタリングして記事を取得（ページネーションなし）
  const { posts } = await getPosts({
    sort: 'publishedAt',
    includeDrafts: false,
    category,
  });

  return {
    posts,
    pagination: {
      page: 1,
      perPage: posts.length,
      total: posts.length,
      totalPages: 1,
    },
    category,
  };
}) satisfies PageServerLoad;
