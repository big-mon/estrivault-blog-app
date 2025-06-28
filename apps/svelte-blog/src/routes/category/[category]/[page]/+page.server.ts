import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

// 完全プリレンダリング設定（全カテゴリ・全ページを静的生成）
export const prerender = true;

export async function entries() {
  const allPosts = await getPosts();

  // 全カテゴリを取得
  const categories = [
    ...new Set(allPosts.posts.map((post: { category: string }) => post.category)),
  ];

  const entries = [];
  for (const category of categories) {
    // カテゴリごとの記事数とページ数を正確に計算
    const categoryPosts = await getPosts({ category });
    const totalPages = Math.ceil(categoryPosts.total / POSTS_PER_PAGE);

    // 全ページを生成
    for (let page = 1; page <= totalPages; page++) {
      entries.push({
        category: category.toLowerCase(),
        page: page.toString(),
      });
    }
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
