import type { PostMeta } from '@estrivault/content-processor';
import { SITE_URL } from '$constants';
import { getAllCategories, getPosts } from '$lib/content';

export const DESIGN_PREVIEW_VARIANTS = [
  'industrial-slate',
  'archive-grid',
  'signal-frame',
] as const;

export type DesignPreviewVariant = (typeof DESIGN_PREVIEW_VARIANTS)[number];

export interface DesignPreviewTheme {
  variant: DesignPreviewVariant;
  name: string;
  kicker: string;
  title: string;
  description: string;
  summary: string;
}

export interface DesignPreviewStats {
  totalPosts: number;
  categoryCount: number;
  averageReadingMinutes: number;
  leadCategoryLabel: string;
}

export interface DesignPreviewModel {
  featuredPost: PostMeta | null;
  posts: PostMeta[];
  stats: DesignPreviewStats;
  sampleTags: string[];
  sampleCategories: string[];
}

export const DESIGN_PREVIEW_THEMES: Record<DesignPreviewVariant, DesignPreviewTheme> = {
  'industrial-slate': {
    variant: 'industrial-slate',
    name: 'Monolith Column',
    kicker: 'Design Preview 01',
    title: 'A single reading axis, stripped to category, title, and text.',
    description:
      'This route treats the top page like a disciplined reading surface with one dominant column and almost no decorative interruption.',
    summary:
      'The mood comes from proportion rather than ornament: hard rules, generous white space, and quiet category markers that organize the page without stealing focus.',
  },
  'archive-grid': {
    variant: 'archive-grid',
    name: 'Monument Banner',
    kicker: 'Design Preview 02',
    title: 'A bold site banner first, then a severe field of text.',
    description:
      'This route gives the blog a stronger front face with a large typographic banner before dropping into a text-led article field.',
    summary:
      'It aims to feel architectural rather than editorially soft: the site name acts like a structure, while the article list remains restrained and readable.',
  },
  'signal-frame': {
    variant: 'signal-frame',
    name: 'Index Frame',
    kicker: 'Design Preview 03',
    title: 'A cold index where category leads and titles carry the weight.',
    description:
      'This route minimizes card behavior and uses alignment, frames, and category columns to produce a sharper, more systematic landing page.',
    summary:
      'The result should feel closest to a technical archive or mission index while still preserving enough summary text to invite reading.',
  },
};

export function isDesignPreviewVariant(value: string): value is DesignPreviewVariant {
  return DESIGN_PREVIEW_VARIANTS.includes(value as DesignPreviewVariant);
}

export function getDesignPreviewHref(variant: DesignPreviewVariant): string {
  return `/design-preview/${variant}`;
}

export function getDesignPreviewCanonical(variant: DesignPreviewVariant): string {
  return `${SITE_URL.replace(/\/$/, '')}${getDesignPreviewHref(variant)}`;
}

export async function getDesignPreviewModel(): Promise<DesignPreviewModel> {
  const [{ posts, total }, categories] = await Promise.all([
    getPosts({ page: 1, perPage: 6 }),
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
  };
}
