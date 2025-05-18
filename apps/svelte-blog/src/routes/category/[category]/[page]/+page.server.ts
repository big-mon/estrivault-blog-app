import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const { category, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // カテゴリーでフィルタリングして全記事を取得
  const { posts: allPosts } = await getPosts({
    sort: 'publishedAt',
    includeDrafts: false,
    category,
  });

  // ページネーション処理
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    pagination: {
      page: currentPage,
      perPage: POSTS_PER_PAGE,
      total: totalPosts,
      totalPages,
    },
    category,
  };
}) satisfies PageServerLoad;
