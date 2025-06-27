import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

// ハイブリッド設定（主要ページはプリレンダリング、その他は動的）
export const prerender = 'auto';

export async function entries() {
  const allPosts = await getPosts();
  const categories = [
    ...new Set(allPosts.posts.map((post: { category: string }) => post.category)),
  ];

  const entries = [];
  for (const category of categories) {
    // 最初のページのみプリレンダリング
    entries.push({
      category: (category as string).toLowerCase(),
      page: '1',
    });
  }

  return entries;
}

export const load = (async ({ params }: { params: Record<string, string> }) => {
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
    const categories = [
      ...new Set(allPosts.posts.map((post: { category: string }) => post.category)),
    ];
    const correctCategory = categories.find(
      (cat: unknown) => (cat as string).toLowerCase() === category?.toLowerCase(),
    );

    if (correctCategory) {
      result = await getPosts({
        category: correctCategory as string,
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
