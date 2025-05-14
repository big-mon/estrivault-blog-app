// API仕様書に基づく型定義

export interface PostMeta {
  /** ファイル名 slug （拡張子なし）*/
  slug: string;
  /** 記事タイトル */
  title: string;
  /** 記事説明 */
  description: string;
  /** 公開日時（ISO8601）*/
  publishedAt: string;
  /** 更新日時（ISO8601, 任意）*/
  updatedAt?: string;
  /** カテゴリ名 */
  category: string;
  /** タグ配列 */
  tags: string[];
  /** カバー画像URL（OG画像 or サムネURL）*/
  coverImage?: string;
  /** 下書きフラグ */
  draft?: boolean;
  /** 読了時間（分, 任意）*/
  readingTime?: number;
}

export interface PostHTML {
  meta: PostMeta;
  html: string; // sanitize済みHTML
}

export interface ProcessorOptions {
  /** 埋め込みプラグインを明示的に追加 */
  embeds?: {
    youtube?: boolean;
    twitter?: boolean;
    github?: boolean;
    amazon?: boolean;
  };
  /** Cloudinary変換ベースURL */
  imageBase?: string;
  /** rehype-sanitize schema (カスタムタグ許可用) */
  sanitizeSchema?: import("hast-util-sanitize").Schema;
}

export interface ProcessorOptions {
  /** 埋め込みプラグインを明示的に追加 */
  embeds?: {
    youtube?: boolean;
    twitter?: boolean;
    github?: boolean;
    amazon?: boolean;
  };
  /** Cloudinaryクラウド名 */
  cloudinaryCloudName?: string;
}

export interface ListOptions extends ProcessorOptions {
  page?: number; // ページ番号（1起点）
  perPage?: number; // デフォルト20
  sort?: "publishedAt" | "title"; // ソートキー
  filter?: (post: PostMeta) => boolean; // フィルタ関数
}

// エラークラス
export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileNotFoundError';
  }
}

export class FrontMatterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrontMatterError';
  }
}

export class MarkdownParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarkdownParseError';
  }
}
