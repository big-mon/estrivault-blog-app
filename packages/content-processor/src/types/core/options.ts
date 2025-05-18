import { PostMeta } from './post';

/**
 * 埋め込みプラグインの設定
 */
export interface EmbedOptions {
  /** YouTube埋め込みを有効にするか */
  youtube?: boolean;
  /** Twitter埋め込みを有効にするか */
  twitter?: boolean;
  /** GitHub埋め込みを有効にするか */
  github?: boolean;
  /** Amazon埋め込みを有効にするか */
  amazon?: boolean;
}

/**
 * プロセッサーのオプション
 */
export interface ProcessorOptions {
  /** 埋め込みプラグインの設定 */
  embeds?: EmbedOptions;
  /** Cloudinaryクラウド名 */
  cloudinaryCloudName?: string;
  /** Cloudinary変換ベースURL */
  imageBase?: string;
  /** rehype-sanitize schema (カスタムタグ許可用) */
  sanitizeSchema?: import('hast-util-sanitize').Schema;
}

/**
 * 一覧取得用のオプション
 */
export interface ListOptions extends ProcessorOptions {
  /** ページ番号（1起点） */
  page?: number;
  /** 1ページあたりの表示件数（デフォルト20） */
  perPage?: number;
  /** ソートキー */
  sort?: 'publishedAt' | 'title';
  /** フィルタ関数 */
  filter?: (post: PostMeta) => boolean;
  /** ベースディレクトリ（デフォルト: カレントディレクトリ） */
  baseDir?: string;
  /** 下書きを含めるかどうか */
  includeDrafts?: boolean;
}
