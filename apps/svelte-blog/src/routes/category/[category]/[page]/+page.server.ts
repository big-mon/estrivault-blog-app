import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

export const prerender = true;

export async function entries() {
  const allPosts = await getPosts();
  const categories = [...new Set(allPosts.posts.map(post => post.category))];
  
  const entries = [];
  for (const category of categories) {
    const categoryPosts = await getPosts({ category });
    const totalPages = categoryPosts.totalPages;
    
    for (let page = 1; page <= totalPages; page++) {
      entries.push({ category, page: page.toString() });
    }
  }
  
  return entries;
}

export const load = (async ({ params }) => {
  const { category, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // getPostsのオプションでカテゴリーフィルタリングとページネーションを実行
  const result = await getPosts({
    category,
    page: currentPage,
    perPage: POSTS_PER_PAGE,
  });

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
