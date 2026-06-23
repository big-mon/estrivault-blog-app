export interface EmbedOptions {
  youtube?: boolean;
  twitter?: boolean;
  github?: boolean;
  amazon?: boolean;
}

export type OgpMode = 'cache-only' | 'fetch' | 'disabled';

export type OgpMetadataSource = 'fetch' | 'manual' | 'fallback';

export type OgpMetadataStatus = 'ok' | 'fallback' | 'error';

export interface OgpMetadataStoreEntry {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
  fetchedAt?: string;
  expiresAt?: string;
  lastAttemptAt?: string;
  lastError?: string;
  source?: OgpMetadataSource;
  status?: OgpMetadataStatus;
}

export interface OgpMetadataStore {
  version?: number;
  entries?: Record<string, OgpMetadataStoreEntry>;
}

export interface OgpOptions {
  mode?: OgpMode;
  metadataStore?: OgpMetadataStore;
  forceRefresh?: boolean;
}

export interface ProcessorOptions {
  embeds?: EmbedOptions;
  cloudinaryCloudName?: string;
  imageBase?: string;
  ogp?: OgpOptions;
}

/** 投稿のメタ情報 */
export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  category: string;
  tags: string[];
  coverImage?: string;
  showArticleThumbnail?: boolean;
  draft?: boolean;
  readingTime?: number;
}

/** 見出し情報 */
export interface HeadingInfo {
  id: string;
  level: number;
  text: string;
}

/** 投稿のメタ・本文 */
export interface PostHTML {
  meta: PostMeta;
  html: string;
  headings: HeadingInfo[];
  originalPath?: string;
  hasCodeBlocks?: boolean;
  hasTwitterEmbeds?: boolean;
  hasAmazonEmbeds?: boolean;
  hasDirectiveBoxes?: boolean;
}
