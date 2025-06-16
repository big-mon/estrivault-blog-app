import matter from 'gray-matter';
import readingTime from 'reading-time';
import { buildUrl } from '@estrivault/cloudinary-utils';
import { createPipeline } from './pipeline';
import type { PostMeta, PostHTML, ProcessorOptions, HeadingInfo } from './types';
import { FrontMatterError, MarkdownParseError } from './errors';

/**
 * フロントマターの解析
 * @param content Markdownコンテンツ（フロントマター含む）
 * @returns 解析されたフロントマターとMarkdownコンテンツ
 */
export function parseFrontmatter(content: string): {
  data: Record<string, any>;
  content: string;
} {
  try {
    const parsed = matter(content);
    return {
      data: parsed.data || {},
      content: parsed.content
    };
  } catch (parseError) {
    throw new MarkdownParseError(
      `フロントマターのパースに失敗しました: ${parseError instanceof Error ? parseError.message : String(parseError)}`
    );
  }
}

/**
 * 画像のURLをCloudinaryのURLに変換する
 * @param coverImage 画像のURLまたは相対パス
 * @param cloudinaryCloudName Cloudinaryクラウド名
 * @returns 変換された画像URL
 */
function resolveCoverImage(coverImage?: string, cloudinaryCloudName: string = ''): string {
  if (!coverImage) return '';
  if (coverImage.startsWith('http') || coverImage.startsWith('data:')) return coverImage;
  // 先頭スラッシュ除去・拡張子除去
  let publicId = coverImage.replace(/^\//, '').replace(/\.[^/.]+$/, '');
  return buildUrl(cloudinaryCloudName, publicId, { w: 800 });
}

/**
 * Markdownコンテンツを処理してHTMLに変換
 * @param content Markdownコンテンツ（フロントマター含む）
 * @param options 処理オプション
 * @param slug 記事のスラッグ（メタデータ構築用、省略時はファイル名から生成）
 * @returns 処理されたPostHTML
 */
export async function processMarkdown(
  content: string, 
  options: ProcessorOptions = {},
  slug?: string
): Promise<PostHTML> {
  try {
    // フロントマターの解析
    const { data, content: markdown } = parseFrontmatter(content);

    // 必須フィールドの検証
    if (!data.title) {
      throw new FrontMatterError('Front-matterにtitleが含まれていません');
    }

    // 読了時間の計算
    const stats = readingTime(markdown);

    // マークダウンをHTMLに変換
    const pipeline = createPipeline(options);
    const result = await pipeline.process(markdown);
    const html = String(result);

    // 見出し情報を取得（heading-extractorプラグインで抽出されたもの）
    const headings: HeadingInfo[] = (result.data as any)?.headings || [];

    // タグを検証して正規化
    const tags = Array.isArray(data.tags)
      ? data.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // メタデータの構築
    const meta: PostMeta = {
      slug: data.slug || slug || '',
      title: data.title,
      description: data.description || '',
      publishedAt: data.publishedAt || new Date().toISOString(),
      updatedAt: data.updatedAt || data.publishedAt || new Date().toISOString(),
      category: data.category || '',
      tags,
      coverImage: resolveCoverImage(data.coverImage, options.cloudinaryCloudName),
      draft: data.draft || false,
      readingTime: Math.ceil(stats.minutes),
    };

    return { meta, html, headings };
  } catch (error) {
    if (error instanceof FrontMatterError || error instanceof MarkdownParseError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new MarkdownParseError(
      `Markdownの処理中にエラーが発生しました: ${message}`
    );
  }
}

/**
 * Markdownコンテンツからメタデータのみを抽出
 * @param content Markdownコンテンツ（フロントマター含む）
 * @param options 処理オプション
 * @param slug 記事のスラッグ（省略時はファイル名から生成）
 * @returns 投稿のメタデータ
 */
export async function extractMetadata(
  content: string,
  options: ProcessorOptions = {},
  slug?: string
): Promise<PostMeta> {
  try {
    // フロントマターの解析
    const { data, content: markdown } = parseFrontmatter(content);

    // 必須フィールドの検証
    if (!data.title) {
      throw new FrontMatterError('Front-matterにtitleが含まれていません');
    }

    // 読了時間の計算
    const stats = readingTime(markdown);

    // タグを検証して正規化
    const tags = Array.isArray(data.tags)
      ? data.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // メタデータの構築
    const meta: PostMeta = {
      slug: data.slug || slug || '',
      title: data.title,
      description: data.description || '',
      publishedAt: data.publishedAt || new Date().toISOString(),
      updatedAt: data.updatedAt || data.publishedAt || new Date().toISOString(),
      category: data.category || '',
      tags,
      coverImage: resolveCoverImage(data.coverImage, options.cloudinaryCloudName),
      draft: data.draft || false,
      readingTime: Math.ceil(stats.minutes),
    };

    return meta;
  } catch (error) {
    if (error instanceof FrontMatterError || error instanceof MarkdownParseError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new MarkdownParseError(
      `メタデータの抽出中にエラーが発生しました: ${message}`
    );
  }
}