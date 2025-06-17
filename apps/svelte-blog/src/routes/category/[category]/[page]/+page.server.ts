import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

// ISR設定
export const config = {
  isr: {
    // 6時間キャッシュ（21600秒）
    expiration: 21600,
    // ソーシャルシェアやアナリティクスなどのクエリパラメータを許可
    allowQuery: ['utm_source', 'utm_medium', 'utm_campaign', 'ref'],
  },
};

export async function entries() {
  const allPosts = await getPosts();
  const categories = [...new Set(allPosts.posts.map((post) => post.category))];

  const entries = [];
  for (const category of categories) {
    const categoryPosts = await getPosts({ category });
    const totalPages = categoryPosts.totalPages;

    for (let page = 1; page <= totalPages; page++) {
      // Generate only lowercase URLs for consistency
      entries.push({ category: category.toLowerCase(), page: page.toString() });
    }
  }

  return entries;
}

export const load = (async ({ params }) => {
  const { category, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // First try exact match, then try case-insensitive match
  let result = await getPosts({
    category,
    page: currentPage,
    perPage: POSTS_PER_PAGE,
  });

  // If no results with exact match, try finding the correct case
  if (result.posts.length === 0) {
    const allPosts = await getPosts();
    const categories = [...new Set(allPosts.posts.map((post) => post.category))];
    const correctCategory = categories.find((cat) => cat.toLowerCase() === category.toLowerCase());

    if (correctCategory) {
      result = await getPosts({
        category: correctCategory,
        page: currentPage,
        perPage: POSTS_PER_PAGE,
      });
    }
  }

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
