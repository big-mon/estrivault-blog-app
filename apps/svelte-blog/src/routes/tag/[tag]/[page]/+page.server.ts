import { getPosts } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad } from './$types';
import type { PostMeta } from '@estrivault/content-processor';

export const load = (async ({ params }) => {
  const { tag, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // getPostsのオプションでタグフィルタリングとページネーションを実行
  const result = await getPosts({
    tag,
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
