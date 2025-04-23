// API仕様書に基づく型定義

export interface PostMeta {
  /** ファイル名 slug （拡張子なし）*/
  slug: string;
  /** 記事タイトル */
  title: string;
  /** ISO 8601 日付文字列 */
  date: string;
  /** カテゴリ名 */
  category: string;
  /** タグ配列 */
  tags: string[];
  /** OG画像 or サムネURL（任意）*/
  thumbnail?: string;
  /** 読了時間（分） */
  readingTime: number;
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
  sanitizeSchema?: any; // import("hast-util-sanitize").Schema
}

export interface ListOptions {
  page?: number; // ページ番号（1起点）
  perPage?: number; // デフォルト20
  sort?: "date" | "title"; // ソートキー
}
