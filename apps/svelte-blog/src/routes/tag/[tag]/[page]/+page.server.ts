import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

// 動的レンダリング設定（Cloudflare制限対応でプリレンダリング無効化）
export const prerender = false;

export const load = (async ({ params }: { params: Record<string, string> }) => {
  const { tag, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // First try exact match, then try case-insensitive match
  let result = await getPosts({
    tag,
    page: currentPage,
    perPage: POSTS_PER_PAGE,
  });

  // If no results with exact match, try finding the correct case
  if (result.posts.length === 0) {
    const allPosts = await getPosts();
    const allTags = new Set<string>();

    allPosts.posts.forEach((post: { tags?: string[] }) => {
      post.tags?.forEach((t: string) => allTags.add(t));
    });

    const correctTag = Array.from(allTags).find((t) => t.toLowerCase() === tag?.toLowerCase());

    if (correctTag) {
      result = await getPosts({
        tag: correctTag,
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
    tag,
  };
}) satisfies PageServerLoad;
