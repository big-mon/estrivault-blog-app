// src/loaders/file-loader.ts
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { createPipeline } from '../pipeline';
import { buildUrl } from '@estrivault/cloudinary-utils';
import type { PostMeta, PostHTML, ProcessorOptions } from '../types';
import { FrontMatterError, MarkdownParseError } from '../errors';

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
  let data: Record<string, any> = {};
  let markdown = '';

  try {
    const content = await readFile(resolvedPath, 'utf-8');

    try {
      const parsed = matter(content);
      data = parsed.data || {};
      markdown = parsed.content;
    } catch (parseError) {
      throw new MarkdownParseError(
        `フロントマターのパースに失敗しました: ${resolvedPath} (${parseError instanceof Error ? parseError.message : String(parseError)})`
      );
    }

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

    // タグを検証して正規化
    const tags = Array.isArray(data.tags)
      ? data.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // メタデータの構築
    const meta: PostMeta = {
      slug: data.slug || filePath.replace(/\.(md|mdx)$/, ''),
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
