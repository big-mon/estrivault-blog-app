import { getPosts } from '$lib';
import type { PageServerLoad } from './$types';
import { POSTS_PER_PAGE } from '../../constants';
import { error } from '@sveltejs/kit';

// メイン一覧と似ているが、古いページは変更頻度が低いためキャッシュ時間をやや長く設定
export const config = {
  isr: {
    // 45分間キャッシュ（2700秒）
    expiration: 2700,
  }
};

export async function entries() {
  const result = await getPosts();
  const totalPages = result.totalPages;

  const entries = [];
  for (let page = 2; page <= totalPages; page++) {
    entries.push({ page: page.toString() });
  }

  return entries;
}

export const load = (async ({ params }) => {
  const pageParam = params.page;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  // ページ番号の検証
  if (isNaN(page) || page < 1) {
    throw error(404, 'Invalid page number');
  }

  // 記事一覧を取得
  const { posts, total, totalPages } = await getPosts({
    page,
    perPage: POSTS_PER_PAGE,
  });

  // ページ番号が総ページ数を超えている場合はエラー
  if (page > totalPages && totalPages > 0) {
    throw error(404, 'Page not found');
  }

  return {
    posts,
    pagination: {
      page,
      perPage: POSTS_PER_PAGE,
      total,
      totalPages,
    },
  };
}) satisfies PageServerLoad;
