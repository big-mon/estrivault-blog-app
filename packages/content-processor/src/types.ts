export interface EmbedOptions {
  youtube?: boolean;
  twitter?: boolean;
  github?: boolean;
  amazon?: boolean;
}

export interface SyntaxHighlightOptions {
  /** テーマ設定 */
  theme?: 
    | string 
    | { 
        light: string; 
        dark: string; 
      };
  /** 背景色を保持するか */
  keepBackground?: boolean;
}

export interface ProcessorOptions {
  embeds?: EmbedOptions;
  cloudinaryCloudName?: string;
  imageBase?: string;
  sanitizeSchema?: import('hast-util-sanitize').Schema;
  syntaxHighlight?: SyntaxHighlightOptions;
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
}
