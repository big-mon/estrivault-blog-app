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
  panelTitle: string;
  panelBody: string;
  metrics: string[];
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
    name: 'Industrial Slate',
    kicker: 'Design Preview 01',
    title: 'Matte graphite panels with a quiet amber signal.',
    description:
      'A denser, harder-tuned landing surface built from rigid cards, measured spacing, and restrained accent color.',
    panelTitle: 'Direction note',
    panelBody:
      'This route studies a mechanical blog index: strong rails, muted materials, and enough contrast to feel precise without becoming noisy.',
    metrics: ['Matte graphite', 'Mechanical rails', 'Amber restraint'],
  },
  'archive-grid': {
    variant: 'archive-grid',
    name: 'Archive Grid',
    kicker: 'Design Preview 02',
    title: 'Index-card order with cold, document-like clarity.',
    description:
      'A lighter concept that borrows from archive shelving and filing systems, using narrow rules and cyan-tinted utility highlights.',
    panelTitle: 'Direction note',
    panelBody:
      'This route focuses on legibility and sorting. It should feel editorial and systematic rather than soft or lifestyle-oriented.',
    metrics: ['Concrete light', 'Document rails', 'Cyan utility'],
  },
  'signal-frame': {
    variant: 'signal-frame',
    name: 'Signal Frame',
    kicker: 'Design Preview 03',
    title: 'A low-glow control frame with warning-color discipline.',
    description:
      'A darker proposal that frames the content like a monitoring surface, with restrained hazard accents and layered depth.',
    panelTitle: 'Direction note',
    panelBody:
      'This route is the most theatrical of the three, but it keeps the content primary by limiting glow and keeping typography crisp.',
    metrics: ['Steel depth', 'Layered frame', 'Hazard accent'],
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
