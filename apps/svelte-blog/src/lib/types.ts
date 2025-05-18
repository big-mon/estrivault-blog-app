export interface Post {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  category: string;
  tags: string[];
  publishedAt: string;
}
