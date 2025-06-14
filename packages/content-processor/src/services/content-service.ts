import type { PostMeta, PostHTML, ProcessorOptions } from '../types';
import { walkMarkdownFiles, findPostBySlug as findPostBySlugUtil } from '../utils/file-walker';

export interface ContentServiceOptions extends ProcessorOptions {
  baseDir?: string;
}

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * コンテンツサービス - 高レベルなコンテンツ操作API
 */
export class ContentService {
  private options: ContentServiceOptions;

  constructor(options: ContentServiceOptions = {}) {
    this.options = options;
  }

  /**
   * 全ての投稿を取得（公開済みのみ）
   */
  async getPosts(): Promise<PostMeta[]> {
    const posts = await walkMarkdownFiles(this.options);
    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * スラッグで投稿を取得
   */
  async getPostBySlug(slug: string): Promise<PostHTML | null> {
    return await findPostBySlugUtil(slug, this.options);
  }

  /**
   * カテゴリで投稿をフィルタリング（ページネーション付き）
   */
  async getPostsByCategory(category: string, page: number = 1, limit: number = 10): Promise<PaginationResult<PostMeta>> {
    const allPosts = await this.getPosts();
    const filteredPosts = allPosts.filter(post => post.category === category);
    
    return this.paginatePosts(filteredPosts, page, limit);
  }

  /**
   * タグで投稿をフィルタリング（ページネーション付き）
   */
  async getPostsByTag(tag: string, page: number = 1, limit: number = 10): Promise<PaginationResult<PostMeta>> {
    const allPosts = await this.getPosts();
    const filteredPosts = allPosts.filter(post => post.tags && post.tags.includes(tag));
    
    return this.paginatePosts(filteredPosts, page, limit);
  }

  /**
   * 投稿をページネーション
   */
  private paginatePosts(posts: PostMeta[], page: number, limit: number): PaginationResult<PostMeta> {
    const totalItems = posts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = posts.slice(startIndex, endIndex);

    return {
      items,
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  /**
   * 全てのカテゴリを取得
   */
  async getCategories(): Promise<string[]> {
    const posts = await this.getPosts();
    const categories = new Set(posts.map(post => post.category).filter(Boolean));
    return Array.from(categories).sort();
  }

  /**
   * 全てのタグを取得
   */
  async getTags(): Promise<string[]> {
    const posts = await this.getPosts();
    const tags = new Set(posts.flatMap(post => post.tags || []).filter(Boolean));
    return Array.from(tags).sort();
  }
}

/**
 * デフォルトのコンテンツサービスインスタンス
 */
let defaultContentService: ContentService | null = null;

function getDefaultService(options?: ContentServiceOptions): ContentService {
  if (!defaultContentService || options) {
    defaultContentService = new ContentService(options);
  }
  return defaultContentService;
}

// 便利な関数をエクスポート
export const getPosts = (options?: ContentServiceOptions) => getDefaultService(options).getPosts();
export const getPostBySlug = (slug: string, options?: ContentServiceOptions) => getDefaultService(options).getPostBySlug(slug);
export const getPostsByCategory = (category: string, page?: number, limit?: number, options?: ContentServiceOptions) => 
  getDefaultService(options).getPostsByCategory(category, page, limit);
export const getPostsByTag = (tag: string, page?: number, limit?: number, options?: ContentServiceOptions) => 
  getDefaultService(options).getPostsByTag(tag, page, limit);
export const getCategories = (options?: ContentServiceOptions) => getDefaultService(options).getCategories();
export const getTags = (options?: ContentServiceOptions) => getDefaultService(options).getTags();