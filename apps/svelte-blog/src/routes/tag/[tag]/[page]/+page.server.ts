import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

// 完全プリレンダリング設定（全タグ・全ページを静的生成）
export const prerender = true;

export async function entries() {
  const allPosts = await getPosts();

  // 全タグを収集
  const allTags = new Set<string>();
  allPosts.posts.forEach((post: { tags?: string[] }) => {
    post.tags?.forEach((tag: string) => allTags.add(tag));
  });

  const entries = [];
  for (const tag of allTags) {
    // タグごとの記事数とページ数を正確に計算
    const tagPosts = await getPosts({ tag });
    const totalPages = Math.ceil(tagPosts.total / POSTS_PER_PAGE);

    // 全ページを生成
    for (let page = 1; page <= totalPages; page++) {
      entries.push({
        tag: tag.toLowerCase(),
        page: page.toString(),
      });
    }
  }

  return entries;
}

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
