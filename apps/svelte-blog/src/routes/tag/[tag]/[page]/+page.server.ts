import { getPosts } from '$lib';
import type { PostMeta } from '@estrivault/content-processor';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';

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
    const pagesToPrerender = Math.min(5, totalPages); // 最大5ページまでプリレンダリング
    
    for (let page = 1; page <= pagesToPrerender; page++) {
      entries.push({ tag, page: page.toString() });
    }
  }
  
  return entries;
}

// プリレンダリングを有効化
export const prerender = true;

export const load = (async ({ params }) => {
  const { tag, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // タグでフィルタリングして全記事を取得
  const { posts: allPosts } = await getPosts({
    tag,
  });

  // ページネーション処理
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  // 存在しないページの場合は404
  if (currentPage > totalPages && currentPage !== 1) {
    throw new Error('Page not found');
  }

  return {
    posts,
    pagination: {
      page: currentPage,
      perPage: POSTS_PER_PAGE,
      total: totalPosts,
      totalPages,
    },
    tag,
  };
}) satisfies PageServerLoad;
