import type { PostMeta } from '@estrivault/content-processor';
import { SITE_URL } from '$constants';
import { getAllCategories, getPosts } from '$lib/content';

export const DESIGN_PREVIEW_VARIANTS = [
  'luxury-01',
  'blue-palette',
  'luxury-04',
  'luxury-07',
] as const;

export type DesignPreviewVariant = (typeof DESIGN_PREVIEW_VARIANTS)[number];

export interface DesignPreviewTheme {
  variant: DesignPreviewVariant;
  name: string;
  kicker: string;
  title: string;
  description: string;
  summary: string;
  swatches: string[];
  bgBase: string;
  bgDeep: string;
  bgAura: string;
  panel: string;
  panelAlt: string;
  text: string;
  textSoft: string;
  border: string;
  borderStrong: string;
  rail: string;
  accent: string;
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
  'blue-palette': {
    variant: 'blue-palette',
    name: 'Blue Palette',
    kicker: 'Palette Preview A',
    title: 'A submerged blue archive with misted rails and cobalt lift.',
    description:
      'This route rebuilds the page around the first reference palette, using a dense navy field, pale dividers, and soft steel-blue highlights across the entire screen.',
    summary:
      'The palette is the main event here: background, shell, switcher, and metadata all tune themselves to the same four blues so the page feels like one cooled surface.',
    swatches: ['#1f2c5d', '#3a539f', '#c2ccdf', '#829fb6'],
    bgBase: '#142a57',
    bgDeep: '#08162d',
    bgAura: 'rgb(58 83 159 / 0.42)',
    panel: 'rgb(18 40 83 / 0.78)',
    panelAlt: 'rgb(194 204 223 / 0.09)',
    text: '#f3f6fc',
    textSoft: '#c7d2e6',
    border: 'rgb(194 204 223 / 0.22)',
    borderStrong: 'rgb(194 204 223 / 0.42)',
    rail: '#c2ccdf',
    accent: '#829fb6',
  },
  'luxury-01': {
    variant: 'luxury-01',
    name: 'Theme 01',
    kicker: 'Base Palette 01',
    title: 'Ink navy, restrained brass, and smoked steel in a colder archive system.',
    description:
      'This route becomes the base direction: near-black blue, restrained brass accents, and smoked steel neutrals arranged with harder rules and less decorative softness.',
    summary:
      'The page should read like an austere mission ledger rather than a luxury editorial: strict rails, dry labels, and minimal effects over a dark instrument surface.',
    swatches: ['#09171f', '#cea17a', '#3e4e5a'],
    bgBase: '#0c1921',
    bgDeep: '#050c11',
    bgAura: 'rgb(206 161 122 / 0.18)',
    panel: 'rgb(10 23 31 / 0.84)',
    panelAlt: 'rgb(206 161 122 / 0.07)',
    text: '#f4eee6',
    textSoft: '#dbc7b3',
    border: 'rgb(206 161 122 / 0.18)',
    borderStrong: 'rgb(206 161 122 / 0.36)',
    rail: '#cea17a',
    accent: '#93a2ad',
  },
  'luxury-04': {
    variant: 'luxury-04',
    name: 'Theme 04',
    kicker: 'Palette Preview 04',
    title: 'Blue-grey metal, dark soot, and a sharp red fault line.',
    description:
      'This route interprets 04 as an industrial control surface: cold slate structures, a darker underlayer, and a disciplined red signal used only where the page needs tension.',
    summary:
      'The overall page stays calm and heavy, but the red accent gives the index a precise warning-light character that is closest to the harder Arknights-like direction.',
    swatches: ['#303d49', '#5d020a', '#1a1e22'],
    bgBase: '#293641',
    bgDeep: '#11161b',
    bgAura: 'rgb(93 2 10 / 0.24)',
    panel: 'rgb(33 43 53 / 0.84)',
    panelAlt: 'rgb(93 2 10 / 0.08)',
    text: '#f2f4f7',
    textSoft: '#cbd2da',
    border: 'rgb(201 209 216 / 0.18)',
    borderStrong: 'rgb(201 209 216 / 0.34)',
    rail: '#d7dce1',
    accent: '#8a0d18',
  },
  'luxury-07': {
    variant: 'luxury-07',
    name: 'Theme 07',
    kicker: 'Palette Preview 07',
    title: 'Night violet with silver rails and muted graphite pressure.',
    description:
      'This route uses the 07 palette to push the page toward a cooler, more nocturnal mood, where silver metadata and low-contrast violet panels carry the entire composition.',
    summary:
      'It is the quietest of the four palettes, relying on small changes in value more than bright accents, which makes the typography feel especially severe.',
    swatches: ['#141424', '#b5b5b6', '#323240'],
    bgBase: '#171828',
    bgDeep: '#09090f',
    bgAura: 'rgb(181 181 182 / 0.16)',
    panel: 'rgb(20 20 36 / 0.86)',
    panelAlt: 'rgb(181 181 182 / 0.08)',
    text: '#f2f2f5',
    textSoft: '#d3d4da',
    border: 'rgb(181 181 182 / 0.18)',
    borderStrong: 'rgb(181 181 182 / 0.34)',
    rail: '#d9d9dc',
    accent: '#727282',
  },
};

export function getDesignPreviewStyle(theme: DesignPreviewTheme): string {
  return [
    `--dp-bg:${theme.bgBase}`,
    `--dp-bg-deep:${theme.bgDeep}`,
    `--dp-bg-aura:${theme.bgAura}`,
    `--dp-panel:${theme.panel}`,
    `--dp-panel-alt:${theme.panelAlt}`,
    `--dp-text:${theme.text}`,
    `--dp-text-soft:${theme.textSoft}`,
    `--dp-border:${theme.border}`,
    `--dp-border-strong:${theme.borderStrong}`,
    `--dp-rail:${theme.rail}`,
    `--dp-accent:${theme.accent}`,
  ].join(';');
}

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
