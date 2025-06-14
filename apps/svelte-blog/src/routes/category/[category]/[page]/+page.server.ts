import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const { category, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // getPostsのオプションでカテゴリーフィルタリングとページネーションを実行
  const result = await getPosts({
    category,
    page: currentPage,
    perPage: POSTS_PER_PAGE,
  });

  return {
    posts: result.posts,
    pagination: {
      page: result.page,
      perPage: result.perPage,
      total: result.total,
      totalPages: result.totalPages,
    },
    category,
  };
}) satisfies PageServerLoad;
