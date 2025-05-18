import { getPosts } from '$lib';
import type { PageServerLoad } from './$types';
import { POSTS_PER_PAGE } from '../constants';

export const load = (async () => {
  // クエリパラメータからページ番号を取得（デフォルトは1）
  const page = 1;
  const perPage = POSTS_PER_PAGE; // 1ページあたりの記事数

  // 記事一覧を取得
  const { posts, total, totalPages } = await getPosts({
    page,
    perPage,
    sort: 'publishedAt',
    includeDrafts: false,
  });

  return {
    posts,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
  };
}) satisfies PageServerLoad;
