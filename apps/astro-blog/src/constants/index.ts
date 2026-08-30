import {
  CATEGORY_META,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from './site-metadata.mjs';

export { CATEGORY_META, SITE_AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL };

export type CategoryKey = keyof typeof CATEGORY_META;

export function getCategoryMeta(category: string): { label: string; description: string } {
  return (
    CATEGORY_META[category as CategoryKey] ?? {
      label: category,
      description: '',
    }
  );
}

export function getCategoryLabel(category: string): string {
  return getCategoryMeta(category).label;
}

export const NAVIGATION_LINKS = [
  { label: 'About', href: '/post/about' },
  { label: 'Notes', href: '/notes/' },
  { label: CATEGORY_META.investing.label, href: '/category/investing/' },
  { label: CATEGORY_META.software.label, href: '/category/software/' },
  { label: CATEGORY_META.ai.label, href: '/category/ai/' },
  { label: CATEGORY_META.games.label, href: '/category/games/' },
  { label: CATEGORY_META.gear.label, href: '/category/gear/' },
  { label: CATEGORY_META.essays.label, href: '/category/essays/' },
];

export const SOCIAL_LINK_X = 'big_mon';
export const SOCIAL_LINK_GITHUB = 'big-mon/estrivault-blog-app';
export const AUTHOR_GITHUB_PROFILE = 'big-mon';

const AUTHOR_PAGE_URL = new URL('/post/about', SITE_URL).toString();

export const AUTHOR_PERSON = {
  '@type': 'Person',
  '@id': `${AUTHOR_PAGE_URL}#author`,
  name: SITE_AUTHOR,
  url: AUTHOR_PAGE_URL,
  sameAs: [`https://x.com/${SOCIAL_LINK_X}`, `https://github.com/${AUTHOR_GITHUB_PROFILE}`],
};

export const POSTS_PER_PAGE = 12;

export const GOOGLE_ADSENSE_CLIENT = 'ca-pub-6950127103154689';
