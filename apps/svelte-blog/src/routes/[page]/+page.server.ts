import { getPosts } from '$lib';
import type { PageServerLoad } from './$types';
import { POSTS_PER_PAGE } from '../../constants';
import { error } from '@sveltejs/kit';

// ISR configuration for paginated blog listing
// Similar to main listing but with slightly longer cache as older pages change less frequently
export const config = {
  isr: {
    // Cache for 45 minutes (2700 seconds)
    expiration: 2700,
    // Allow bypass for development/preview purposes (optional)
    ...(process.env.PRERENDER_BYPASS_TOKEN && { bypassToken: process.env.PRERENDER_BYPASS_TOKEN }),
    // Allow these query parameters for analytics
    allowQuery: ['utm_source', 'utm_medium', 'utm_campaign', 'ref']
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