// src/loaders/file-loader.ts
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { createPipeline } from '../pipeline/pipeline';
import { buildUrl } from '@estrivault/cloudinary-utils';
import type { PostMeta, PostHTML, ProcessorOptions } from '../types';
import { FrontMatterError, MarkdownParseError } from '../types/errors';

export interface LoadFileOptions extends ProcessorOptions {
  /**
   * ファイルのベースディレクトリ
   * @default process.cwd()
   */
  cwd?: string;
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
 * 単一のマークダウンファイルを読み込む
 * @param filePath 読み込むファイルのパス
 * @param options オプション
 * @returns 読み込まれたコンテンツとメタデータ
 * @throws {FrontMatterError} フロントマターの検証エラー
 * @throws {MarkdownParseError} マークダウンの処理エラー
 */
export async function loadFile(filePath: string, options: LoadFileOptions = {}): Promise<PostHTML> {
  const resolvedPath = resolve(options.cwd || process.cwd(), filePath);

  try {
    // ファイルを読み込む
    const content = await readFile(resolvedPath, 'utf-8');
    const { data, content: markdown } = matter(content);

    // 必須フィールドの検証
    if (!data.title) {
      throw new FrontMatterError(`Front-matterにtitleが含まれていません: ${filePath}`);
    }

    // 読了時間の計算
    const stats = readingTime(markdown);

    // マークダウンをHTMLに変換
    const pipeline = createPipeline(options);
    const result = await pipeline.process(markdown);
    const html = String(result);

    // メタデータの構築
    const meta: PostMeta = {
      slug: data.slug || filePath.replace(/\.(md|mdx)$/, ''),
      title: data.title,
      description: data.description || '',
      publishedAt: data.publishedAt || new Date().toISOString(),
      updatedAt: data.updatedAt || data.publishedAt || new Date().toISOString(),
      category: data.category || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      coverImage: resolveCoverImage(data.coverImage, options.cloudinaryCloudName),
      draft: data.draft || false,
      readingTime: Math.ceil(stats.minutes),
    };

    return { meta, html };
  } catch (error) {
    if (error instanceof FrontMatterError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new MarkdownParseError(
      `ファイルの処理中にエラーが発生しました (${filePath}): ${message}`
    );
  }
}

/**
 * マークダウン文字列を処理する
 * @param content 処理するマークダウン文字列
 * @param options オプション
 * @returns 処理されたHTMLとメタデータ
 * @throws {FrontMatterError} フロントマターの検証エラー
 * @throws {MarkdownParseError} マークダウンの処理エラー
 */
export async function processMarkdown(
  content: string,
  options: ProcessorOptions = {}
): Promise<PostHTML> {
  try {
    const { data, content: markdown } = matter(content);

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

    // メタデータの構築
    const meta: PostMeta = {
      slug: data.slug || '',
      title: data.title,
      description: data.description || '',
      publishedAt: data.publishedAt || new Date().toISOString(),
      updatedAt: data.updatedAt || data.publishedAt || new Date().toISOString(),
      category: data.category || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      coverImage: resolveCoverImage(data.coverImage, options.cloudinaryCloudName),
      draft: data.draft || false,
      readingTime: Math.ceil(stats.minutes),
    };

    return { meta, html };
  } catch (error) {
    if (error instanceof FrontMatterError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new MarkdownParseError(`マークダウンの処理中にエラーが発生しました: ${message}`);
  }
}
