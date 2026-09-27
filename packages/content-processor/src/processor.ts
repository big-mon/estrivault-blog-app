import matter from 'gray-matter';
import readingTime from 'reading-time';
import { buildUrl } from '@estrivault/cloudinary-utils';
import { createPipeline } from './pipeline';
import { findOgpLinks } from './plugins/embeds/common-link-embed';
import { hasCodeBlocks } from './utils/code-detector';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import type { PostMeta, PostHTML, ProcessorOptions, HeadingInfo } from './types';
import { FrontMatterError, MarkdownParseError } from './errors';

const markdownParser = unified().use(remarkParse).use(remarkDirective).use(remarkGfm);

export function extractOgpUrls(source: string): string[] {
  const { content } = parseFrontmatter(source);
  return [...new Set(findOgpLinks(markdownParser.parse(content)).map(({ url }) => url))];
}

/**
 * フロントマターの解析
 * @param content Markdownコンテンツ（フロントマター含む）
 * @returns 解析されたフロントマターとMarkdownコンテンツ
 */
export function parseFrontmatter(content: string): {
  data: Record<string, unknown>;
  content: string;
} {
  try {
    const parsed = matter(content);
    return {
      data: parsed.data || {},
      content: parsed.content,
    };
  } catch (parseError) {
    throw new MarkdownParseError(
      `フロントマターのパースに失敗しました: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
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
  if (!cloudinaryCloudName) {
    return coverImage.startsWith('/') ? coverImage : `/${coverImage.replace(/^\.?\//, '')}`;
  }
  // 先頭スラッシュ除去・拡張子除去
  const publicId = coverImage.replace(/^\//, '').replace(/\.[^/.]+$/, '');
  return buildUrl(cloudinaryCloudName, publicId, { w: 1200, quality: 85 });
}

function normalizeDateField(
  value: unknown,
  invalidFallback: unknown,
  invalidMessage: string,
): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  let dateValue = value;
  if (dateValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
    dateValue = dateValue + '.000Z';
  } else if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    dateValue = dateValue + 'T00:00:00.000Z';
  }

  if (isNaN(Date.parse(dateValue))) {
    console.warn(invalidMessage);
    return invalidFallback;
  }

  return dateValue;
}

function normalizePostMeta(
  data: Record<string, unknown>,
  markdown: string,
  options: ProcessorOptions = {},
  slug?: string,
): PostMeta {
  if (!data.title) {
    throw new FrontMatterError('Front-matterにtitleが含まれていません');
  }

  const stats = readingTime(markdown, { wordsPerMinute: 600 });
  const tags =
    Array.isArray(data.tags) ?
      data.tags
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    : [];

  const publishedAtValue =
    data.publishedAt ?
      normalizeDateField(
        data.publishedAt,
        new Date().toISOString(),
        `Invalid publishedAt format: ${data.publishedAt}, using current date`,
      )
    : new Date().toISOString();
  const publishedAt = new Date(publishedAtValue as string);

  const updatedAtSource = data.updatedAt || publishedAtValue;
  const updatedAtValue = normalizeDateField(
    updatedAtSource,
    publishedAtValue,
    `Invalid updatedAt format: ${data.updatedAt}, using publishedAt`,
  );
  const updatedAt = new Date(updatedAtValue as string);

  return {
    slug: (data.slug as string) || slug || '',
    title: data.title as string,
    description: (data.description as string) || '',
    publishedAt,
    updatedAt,
    category: (data.category as string) || '',
    tags,
    coverImage: resolveCoverImage(
      data.coverImage as string | undefined,
      options.cloudinaryCloudName,
    ),
    showArticleThumbnail: data.showArticleThumbnail !== false,
    draft: (data.draft as boolean) || false,
    readingTime: Math.ceil(stats.minutes),
  };
}

/**
 * Markdownコンテンツ（フロントマター付き）を解析し、HTML・メタデータ・見出し情報・各種埋め込み検出結果を返します。
 *
 * Markdown本文からフロントマターを抽出・検証し、HTMLへの変換、タグや日付の正規化、読了時間の算出、コードブロックの検出を行います。
 *
 * @param content - フロントマターを含むMarkdownコンテンツ
 * @param options - Markdown処理のオプション
 * @param slug - 記事のスラッグ（省略時は空文字列）
 * @returns HTML本文、メタデータ、見出し情報、コードブロックの有無を含むオブジェクト
 */
export async function processMarkdown(
  content: string,
  options: ProcessorOptions = {},
  slug?: string,
): Promise<PostHTML> {
  try {
    // フロントマターの解析
    const { data, content: markdown } = parseFrontmatter(content);
    const meta = normalizePostMeta(data, markdown, options, slug);

    // マークダウンをパースしてコードブロックを自動検出
    const parseResult = markdownParser.parse(markdown);

    // シンタックスハイライトが必要か判定
    const enableSyntaxHighlight = hasCodeBlocks(parseResult);

    // パイプラインでHTMLに変換
    const pipeline = createPipeline(options, enableSyntaxHighlight);
    const result = await pipeline.process(markdown);
    const html = String(result);

    // アンカー生成時に収集した見出し情報を取得
    const headings: HeadingInfo[] =
      ((result.data as Record<string, unknown>)?.headings as HeadingInfo[]) || [];

    return {
      meta,
      html,
      headings,
      hasCodeBlocks: enableSyntaxHighlight,
    };
  } catch (error) {
    if (error instanceof FrontMatterError || error instanceof MarkdownParseError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new MarkdownParseError(`Markdownの処理中にエラーが発生しました: ${message}`);
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
  slug?: string,
): Promise<PostMeta> {
  try {
    // フロントマターの解析
    const { data, content: markdown } = parseFrontmatter(content);

    return normalizePostMeta(data, markdown, options, slug);
  } catch (error) {
    if (error instanceof FrontMatterError || error instanceof MarkdownParseError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new MarkdownParseError(`メタデータの抽出中にエラーが発生しました: ${message}`);
  }
}

/** Shared note metadata for HTML pages and public Markdown artifacts. */
export function extractNoteMetadata(source: string, filePath: string, slug: string) {
  const { data } = parseFrontmatter(source);
  for (const field of ['title', 'publishedAt', 'tags']) {
    if (!data[field] || (field === 'tags' && !Array.isArray(data.tags))) {
      throw new Error(`Required frontmatter field "${field}" is missing: ${filePath}`);
    }
  }
  const value = data.publishedAt;
  const publishedAt =
    value instanceof Date ? value
    : typeof value === 'string' || typeof value === 'number' ? new Date(value)
    : new Date(NaN);
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error(`Required frontmatter field "publishedAt" is invalid: ${filePath}`);
  }
  return {
    slug: (data.slug as string) || slug,
    title: data.title as string,
    publishedAt,
    tags: (data.tags as unknown[])
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) => tag.trim()),
  };
}
