import { getPosts } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
  // クエリパラメータからページ番号を取得（デフォルトは1）
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = 9; // 1ページあたりの記事数

  // 記事一覧を取得
  const { posts, total, totalPages } = await getPosts({
    page,
    perPage,
    sort: 'date',
    includeDrafts: false
  });

  return {
    posts,
    pagination: {
      page,
      perPage,
      total,
      totalPages
    }
  };
}) satisfies PageServerLoad;
