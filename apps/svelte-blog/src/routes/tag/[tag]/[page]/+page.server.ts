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
    const pages = Math.max(1, totalPages);

    for (let page = 1; page <= pages; page++) {
      entries.push({ tag, page: page.toString() });
    }
  }

  return entries;
}

// プリレンダリングを有効化
export const prerender = true;

export const load = (async ({ params, setHeaders }) => {
  try {
    const { tag, page: pageParam } = params;
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

    // ページ番号のバリデーション
    if (isNaN(currentPage) || currentPage < 1) {
      return {
        status: 404,
        error: 'Page not found',
      };
    }

    // タグでフィルタリングして全記事を取得
    const { posts: allPosts } = await getPosts({ tag });

    // タグが存在しない、または記事がない場合
    if (!allPosts || allPosts.length === 0) {
      return {
        status: 404,
        error: 'Tag not found',
      };
    }

    // ページネーション処理
    const totalPosts = allPosts.length;
    const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

    // 存在しないページにアクセスした場合
    if (currentPage > totalPages) {
      return {
        status: 404,
        error: 'Page not found',
      };
    }

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const posts = allPosts.slice(startIndex, endIndex);

    // キャッシュ制御ヘッダーを設定（オプション）
    setHeaders({
      'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
    });

    return {
      posts,
      pagination: {
        page: currentPage,
        perPage: POSTS_PER_PAGE,
        total: totalPosts,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      tag,
      status: 200,
    };
  } catch (error) {
    console.error(`Error loading tag page (${params.tag}/${params.page}):`, error);
    return {
      status: 500,
      error: 'Internal server error',
    };
  }
}) satisfies PageServerLoad;
