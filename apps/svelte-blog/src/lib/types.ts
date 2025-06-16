export interface Post {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  updatedAt?: Date;
  draft?: boolean;
  readingTime?: number;
}
