export const SITE_TITLE = 'Estrilda';
export const SITE_DESCRIPTION =
  '投資分析、ソフトウェア開発、AI活用、ゲーム攻略、ギアレビュー、考察を蓄積する個人アーカイブです。';
export const SITE_AUTHOR = 'Estrilda';
export const SITE_URL = 'https://estrilda.damonge.com/';

export const CATEGORY_META = {
  investing: {
    label: '投資・企業分析',
    description: '銘柄分析、投資戦略、SEC資料、業界分析',
  },
  software: {
    label: '開発・Web',
    description: 'Web開発、API、開発環境、ブログ基盤',
  },
  ai: {
    label: 'AI・生成ツール',
    description: 'Claude Code、ChatGPT、Stable Diffusion、AI活用',
  },
  games: {
    label: 'ゲーム',
    description: '攻略、MOD、翻訳、設定、トラブルシュート',
  },
  gear: {
    label: 'ギア・装備レビュー',
    description: 'サバゲー装備、オーディオ、キーボード、物理ガジェット',
  },
  essays: {
    label: '考察・エッセイ',
    description: '社会、ビジネス、体験、意見記事',
  },
  meta: {
    label: 'このサイトについて',
    description: 'サイト紹介、運営方針、更新情報',
  },
} as const;

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
  { label: CATEGORY_META.investing.label, href: '/category/investing/1' },
  { label: CATEGORY_META.software.label, href: '/category/software/1' },
  { label: CATEGORY_META.ai.label, href: '/category/ai/1' },
  { label: CATEGORY_META.games.label, href: '/category/games/1' },
  { label: CATEGORY_META.gear.label, href: '/category/gear/1' },
  { label: CATEGORY_META.essays.label, href: '/category/essays/1' },
];

export const SOCIAL_LINK_X = 'big_mon';
export const SOCIAL_LINK_GITHUB = 'big-mon/estrivault-blog-app';

export const POSTS_PER_PAGE = 12;

export const GITHUB_REPO = 'https://github.com/big-mon/estrivault-blog-app';
export const MAIN_BRANCH = 'main';

export const GOOGLE_ADSENSE_CLIENT = 'ca-pub-6950127103154689';
