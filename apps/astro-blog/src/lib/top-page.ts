import type { PostMeta } from '@estrivault/content-processor';
import { getAllCategories, getPosts } from '$lib/content';

export interface TopPageStats {
  totalPosts: number;
  categoryCount: number;
  averageReadingMinutes: number;
  leadCategoryLabel: string;
}

export interface TopPageModel {
  featuredPost: PostMeta | null;
  posts: PostMeta[];
  stats: TopPageStats;
  sampleTags: string[];
  sampleCategories: string[];
  currentPage: number;
  totalPages: number;
}

interface GetTopPageModelOptions {
  page: number;
  perPage: number;
}

export async function getTopPageModel({
  page,
  perPage,
}: GetTopPageModelOptions): Promise<TopPageModel> {
  const [{ posts, total, totalPages }, categories] = await Promise.all([
    getPosts({ page, perPage }),
    getAllCategories(),
  ]);

  const [featuredPost, ...restPosts] = posts;
  const visiblePosts = featuredPost ? restPosts : [];
  const sampleTags = [...new Set(posts.flatMap((post) => post.tags))].slice(0, 8);
  const readingMinutes = posts
    .map((post) => Math.ceil(post.readingTime ?? 0))
    .filter((value) => value > 0);
  const averageReadingMinutes =
    readingMinutes.length > 0 ?
      Math.round(readingMinutes.reduce((sum, value) => sum + value, 0) / readingMinutes.length)
    : 0;

  return {
    featuredPost: featuredPost ?? null,
    posts: visiblePosts,
    stats: {
      totalPosts: total,
      categoryCount: categories.length,
      averageReadingMinutes,
      leadCategoryLabel: featuredPost?.category ?? 'N/A',
    },
    sampleTags,
    sampleCategories: categories.slice(0, 6),
    currentPage: page,
    totalPages,
  };
}
