import matter from 'gray-matter';
import readingTime from 'reading-time';
import { buildUrl } from '@estrivault/cloudinary-utils';
import { createPipeline } from './pipeline';
import { hasCodeBlocks } from './utils/code-detector';
import { hasTwitterEmbeds } from './utils/twitter-detector';
import { hasAmazonEmbeds } from './utils/amazon-detector';
import { hasDirectiveBoxes } from './utils/directive-boxes-detector';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import type { PostMeta, PostHTML, ProcessorOptions, HeadingInfo } from './types';
import { FrontMatterError, MarkdownParseError } from './errors';

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
  // 先頭スラッシュ除去・拡張子除去
  const publicId = coverImage.replace(/^\//, '').replace(/\.[^/.]+$/, '');
  return buildUrl(cloudinaryCloudName, publicId, { w: 1200, quality: 85 });
}

/**
 * Markdownコンテンツ（フロントマター付き）を解析し、HTML・メタデータ・見出し情報・各種埋め込み検出結果を返します。
 *
 * Markdown本文からフロントマターを抽出・検証し、HTMLへの変換、タグや日付の正規化、読了時間の算出、コードブロックや埋め込み要素（Twitter、Amazon、ディレクティブボックス）の有無を判定します。
 *
 * @param content - フロントマターを含むMarkdownコンテンツ
 * @param options - Markdown処理のオプション
 * @param slug - 記事のスラッグ（省略時は空文字列）
 * @returns HTML本文、メタデータ、見出し情報、コードブロック・埋め込み要素の有無を含むオブジェクト
 */
export async function processMarkdown(
  content: string,
  options: ProcessorOptions = {},
  slug?: string,
): Promise<PostHTML> {
  try {
    // フロントマターの解析
    const { data, content: markdown } = parseFrontmatter(content);

    // 必須フィールドの検証
    if (!data.title) {
      throw new FrontMatterError('Front-matterにtitleが含まれていません');
    }

    // 読了時間の計算
    const stats = readingTime(markdown, { wordsPerMinute: 600 });

    // マークダウンをパースしてコードブロックを自動検出
    const parseProcessor = unified().use(remarkParse).use(remarkDirective).use(remarkGfm);

    const parseResult = parseProcessor.parse(markdown);

    // 各種埋め込みの存在を検出
    const enableSyntaxHighlight = hasCodeBlocks(parseResult);
    const enableTwitterEmbeds = hasTwitterEmbeds(parseResult);
    const enableAmazonEmbeds = hasAmazonEmbeds(parseResult);
    const enableDirectiveBoxes = hasDirectiveBoxes(parseResult);

    // パイプラインでHTMLに変換
    const pipeline = createPipeline(options, enableSyntaxHighlight);
    const result = await pipeline.process(markdown);
    const html = String(result);

    // 見出し情報を取得（heading-extractorプラグインで抽出されたもの）
    const headings: HeadingInfo[] =
      ((result.data as Record<string, unknown>)?.headings as HeadingInfo[]) || [];

    // タグを検証して正規化
    const tags =
      Array.isArray(data.tags) ?
        data.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // 日付の正規化とDate型への変換
    let publishedAtStr = data.publishedAt as string | undefined;
    if (publishedAtStr) {
      if (typeof publishedAtStr === 'string') {
        // "2022-03-24T17:42:00" のような形式を "2022-03-24T17:42:00.000Z" に修正
        if (publishedAtStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
          publishedAtStr = publishedAtStr + '.000Z';
        }
        // "2022-03-24" のような形式を "2022-03-24T00:00:00.000Z" に修正
        else if (publishedAtStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          publishedAtStr = publishedAtStr + 'T00:00:00.000Z';
        }
        // 無効な日付の場合は現在日時を使用
        if (isNaN(Date.parse(publishedAtStr))) {
          console.warn(`Invalid publishedAt format: ${data.publishedAt}, using current date`);
          publishedAtStr = new Date().toISOString();
        }
      }
    } else {
      publishedAtStr = new Date().toISOString();
    }
    const publishedAt = new Date(publishedAtStr as string);

    let updatedAtStr = (data.updatedAt as string | undefined) || publishedAtStr;
    if (updatedAtStr && typeof updatedAtStr === 'string') {
      // 同様にupdatedAtも正規化
      if (updatedAtStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
        updatedAtStr = updatedAtStr + '.000Z';
      } else if (updatedAtStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        updatedAtStr = updatedAtStr + 'T00:00:00.000Z';
      }
      if (isNaN(Date.parse(updatedAtStr))) {
        console.warn(`Invalid updatedAt format: ${data.updatedAt}, using publishedAt`);
        updatedAtStr = publishedAtStr;
      }
    }
    const updatedAt = new Date(updatedAtStr as string);

    // メタデータの構築
    const meta: PostMeta = {
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
      draft: (data.draft as boolean) || false,
      readingTime: Math.ceil(stats.minutes),
    };

    return {
      meta,
      html,
      headings,
      hasCodeBlocks: enableSyntaxHighlight,
      hasTwitterEmbeds: enableTwitterEmbeds,
      hasAmazonEmbeds: enableAmazonEmbeds,
      hasDirectiveBoxes: enableDirectiveBoxes,
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

    // 必須フィールドの検証
    if (!data.title) {
      throw new FrontMatterError('Front-matterにtitleが含まれていません');
    }

    // 読了時間の計算
    const stats = readingTime(markdown, { wordsPerMinute: 600 });

    // タグを検証して正規化
    const tags =
      Array.isArray(data.tags) ?
        data.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // 日付の正規化とDate型への変換
    let publishedAtStr = data.publishedAt as string | undefined;
    if (publishedAtStr) {
      if (typeof publishedAtStr === 'string') {
        // "2022-03-24T17:42:00" のような形式を "2022-03-24T17:42:00.000Z" に修正
        if (publishedAtStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
          publishedAtStr = publishedAtStr + '.000Z';
        }
        // "2022-03-24" のような形式を "2022-03-24T00:00:00.000Z" に修正
        else if (publishedAtStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          publishedAtStr = publishedAtStr + 'T00:00:00.000Z';
        }
        // 無効な日付の場合は現在日時を使用
        if (isNaN(Date.parse(publishedAtStr))) {
          console.warn(`Invalid publishedAt format: ${data.publishedAt}, using current date`);
          publishedAtStr = new Date().toISOString();
        }
      }
    } else {
      publishedAtStr = new Date().toISOString();
    }
    const publishedAt = new Date(publishedAtStr as string);

    let updatedAtStr = (data.updatedAt as string | undefined) || publishedAtStr;
    if (updatedAtStr && typeof updatedAtStr === 'string') {
      // 同様にupdatedAtも正規化
      if (updatedAtStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
        updatedAtStr = updatedAtStr + '.000Z';
      } else if (updatedAtStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        updatedAtStr = updatedAtStr + 'T00:00:00.000Z';
      }
      if (isNaN(Date.parse(updatedAtStr))) {
        console.warn(`Invalid updatedAt format: ${data.updatedAt}, using publishedAt`);
        updatedAtStr = publishedAtStr;
      }
    }
    const updatedAt = new Date(updatedAtStr as string);

    // メタデータの構築
    const meta: PostMeta = {
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
      draft: (data.draft as boolean) || false,
      readingTime: Math.ceil(stats.minutes),
    };

    return meta;
  } catch (error) {
    if (error instanceof FrontMatterError || error instanceof MarkdownParseError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new MarkdownParseError(`メタデータの抽出中にエラーが発生しました: ${message}`);
  }
}
