// 投稿・HTML関連の型

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  coverImage?: string;
  draft?: boolean;
  readingTime?: number;
}

export interface PostHTML {
  meta: PostMeta;
  html: string;
}
