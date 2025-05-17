/**
 * 投稿のメタデータを表すインターフェース
 */
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

/**
 * 処理済みのHTMLとメタデータを表すインターフェース
 */
export interface PostHTML {
  /** メタデータ */
  meta: PostMeta;
  /** サニタイズ済みHTML */
  html: string;
}
