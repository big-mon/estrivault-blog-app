export interface Post {
    title: string;
    slug: string;
    date: string;
    description: string;
    coverImage?: string;
    category: string;
    tags: string[];
}