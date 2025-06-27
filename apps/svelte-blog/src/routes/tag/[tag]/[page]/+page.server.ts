import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';
import type { PostMeta } from '@estrivault/content-processor';

// ハイブリッド設定（主要ページはプリレンダリング、その他は動的）
export const prerender = 'auto';

export async function entries() {
  // すべての記事を取得してタグを収集
  const allPosts = await getPosts();
  const tagStats = new Map<string, number>();

  allPosts.posts.forEach((post: PostMeta) => {
    post.tags?.forEach((tag: string) => {
      const normalizedTag = tag.toLowerCase();
      tagStats.set(normalizedTag, (tagStats.get(normalizedTag) || 0) + 1);
    });
  });

  // 使用頻度順でソートし、上位タグのみプリレンダリング（Cloudflare制限対応）
  const topTags = Array.from(tagStats.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20) // 上位20タグのみ
    .map(([tag]) => tag);

  // 各タグの最初のページのみプリレンダリング
  const entries = [];
  for (const tag of topTags) {
    entries.push({ tag, page: '1' });
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

// プリレンダリングするタグとページの組み合わせを生成
