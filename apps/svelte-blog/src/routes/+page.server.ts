import { getPosts } from '$lib';
import type { PageServerLoad } from './$types';
import { POSTS_PER_PAGE } from '../constants';

// メインブログ一覧ページのISR設定
// 新しい記事が追加されると频繁に変更されるため、キャッシュ時間を短く設定
export const config = {
  isr: {
    // 30分間キャッシュ（1800秒）
    expiration: 1800,
    // アナリティクス用のクエリパラメータを許可
    allowQuery: ['utm_source', 'utm_medium', 'utm_campaign', 'ref']
  }
};

export const load = (async () => {
  // クエリパラメータからページ番号を取得（デフォルトは1）
  const page = 1;
  const perPage = POSTS_PER_PAGE; // 1ページあたりの記事数

  // 記事一覧を取得
  const { posts, total, totalPages } = await getPosts({
    page,
    perPage,
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
