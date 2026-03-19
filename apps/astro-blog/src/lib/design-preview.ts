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
  latestPublishedLabel: string;
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
    name: 'Essay Stack',
    kicker: 'Design Preview 01',
    title: 'A quiet single-column index for slow reading.',
    description:
      'A calm editorial stack that treats titles, summaries, and publishing metadata as the primary surface.',
    summary:
      'The focus is a gentle reading rhythm: one strong lead entry, restrained separators, and enough whitespace to feel like the opening spread of a literary journal.',
  },
  'archive-grid': {
    variant: 'archive-grid',
    name: 'Editorial Split',
    kicker: 'Design Preview 02',
    title: 'A text-led index with a narrow editorial sidebar.',
    description:
      'A two-column composition where the article list stays central and supporting taxonomy moves into a slim companion rail.',
    summary:
      'This option keeps the page airy, but improves browseability with a right-side context column for tags, categories, and site notes.',
  },
  'signal-frame': {
    variant: 'signal-frame',
    name: 'Index Ledger',
    kicker: 'Design Preview 03',
    title: 'A ledger-like article list with structured metadata.',
    description:
      'A denser arrangement that reduces card styling and lets alignment, rules, and metadata columns define the experience.',
    summary:
      'This route leans closest to an index or bibliography while still giving each post enough summary text to feel readable.',
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
  const latestPublishedLabel =
    featuredPost ?
      new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(featuredPost.publishedAt)
    : 'N/A';

  return {
    featuredPost: featuredPost ?? null,
    posts: visiblePosts,
    stats: {
      totalPosts: total,
      categoryCount: categories.length,
      averageReadingMinutes,
      latestPublishedLabel,
    },
    sampleTags,
    sampleCategories: categories.slice(0, 6),
  };
}
