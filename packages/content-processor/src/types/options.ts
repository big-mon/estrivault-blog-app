// プロセッサ・一覧・ローダー系の型
import type { PostMeta } from './post';

export interface EmbedOptions {
  youtube?: boolean;
  twitter?: boolean;
  github?: boolean;
  amazon?: boolean;
}

export interface ProcessorOptions {
  embeds?: EmbedOptions;
  cloudinaryCloudName?: string;
  imageBase?: string;
  sanitizeSchema?: import('hast-util-sanitize').Schema;
}

export interface ListOptions<T = PostMeta> extends ProcessorOptions {
  page?: number;
  perPage?: number;
  sort?: 'publishedAt' | 'title';
  filter?: (post: T) => boolean;
  baseDir?: string;
  includeDrafts?: boolean;
}

export interface DirectoryLoadedItem {
  filePath: string;
  meta: PostMeta;
  // 必要に応じて他のフィールドも追加
}
export type DirectoryLoaderResult = DirectoryLoadedItem[];
