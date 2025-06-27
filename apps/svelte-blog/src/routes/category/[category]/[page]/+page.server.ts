import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

// ハイブリッド設定（主要ページはプリレンダリング、その他は動的）
export const prerender = 'auto';

export async function entries() {
  const allPosts = await getPosts();

  // カテゴリ別の記事数を計算
  const categoryStats = new Map<string, number>();
  allPosts.posts.forEach((post: { category: string }) => {
    const category = post.category;
    categoryStats.set(category, (categoryStats.get(category) || 0) + 1);
  });

  // 記事数順でソートし、上位カテゴリのみプリレンダリング（Cloudflare制限対応）
  const topCategories = Array.from(categoryStats.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // 上位10カテゴリのみ
    .map(([category]) => category);

  const entries = [];
  for (const category of topCategories) {
    // 最初のページのみプリレンダリング
    entries.push({
      category: category.toLowerCase(),
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
