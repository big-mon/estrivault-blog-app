import { getPosts, getAllTags } from '$lib';
import { POSTS_PER_PAGE } from '$constants';
import type { PageServerLoad, EntryGenerator } from './$types';

export const entries: EntryGenerator = async () => {
  const tags = await getAllTags();

  const allEntries = [];

  for (const tag of tags) {
    // タグごとの記事数を取得
    const { total } = await getPosts({
      tag,
      includeDrafts: false,
    });

    // ページ数を計算
    const totalPages = Math.ceil(total / POSTS_PER_PAGE);

    // 各ページのエントリを生成
    const tagEntries = [];
    for (let page = 1; page <= totalPages; page++) {
      const entry = { tag, page: page.toString() };
      tagEntries.push(entry);
    }

    allEntries.push(...tagEntries);
  }

  return allEntries;
};

export const load = (async ({ params }) => {
  const { tag, page: pageParam } = params;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // タグでフィルタリングして全記事を取得
  const { posts: allPosts } = await getPosts({
    sort: 'publishedAt',
    includeDrafts: false,
    tag,
  });

  // ページネーション処理
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

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
