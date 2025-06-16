import { getPosts } from '$lib';
import type { PageServerLoad } from './$types';
import { POSTS_PER_PAGE } from '../constants';

// ISR configuration for main blog listing
// This page changes more frequently as new posts are added, so shorter cache time
export const config = {
  isr: {
    // Cache for 30 minutes (1800 seconds)
    expiration: 1800,
    // Allow bypass for development/preview purposes
    bypassToken: process.env.PRERENDER_BYPASS_TOKEN,
    // Allow these query parameters for analytics
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
