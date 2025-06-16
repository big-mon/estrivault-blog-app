import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';
import type { PostMeta } from '@estrivault/content-processor';

// ISR configuration for tag pages
// Tag pages change when new posts are added with that tag
export const config = {
  isr: {
    // Cache for 45 minutes (2700 seconds)
    expiration: 2700,
    // Allow bypass for development/preview purposes
    bypassToken: process.env.PRERENDER_BYPASS_TOKEN,
    // Allow these query parameters for analytics
    allowQuery: ['utm_source', 'utm_medium', 'utm_campaign', 'ref']
  }
};

export const load = (async ({ params }) => {
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
    
    allPosts.posts.forEach((post) => {
      post.tags?.forEach((t: string) => allTags.add(t));
    });
    
    const correctTag = Array.from(allTags).find(t => t.toLowerCase() === tag.toLowerCase());
    
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
export async function entries() {
  // すべての記事を取得してタグを収集
  const allPosts = await getPosts();
  const tags = new Set<string>();

  allPosts.posts.forEach((post: PostMeta) => {
    post.tags?.forEach((tag: string) => tags.add(tag.toLowerCase()));
  });

  // 各タグに対して最大5ページ分のエントリを生成
  const entries = [];
  for (const tag of tags) {
    const postsForTag = await getPosts({ tag });
    const totalPages = Math.ceil(postsForTag.total / POSTS_PER_PAGE);
    const pages = Math.max(1, totalPages);

    for (let page = 1; page <= pages; page++) {
      entries.push({ tag, page: page.toString() });
    }
  }

  return entries;
}
