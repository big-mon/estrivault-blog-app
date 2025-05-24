import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { glob } from 'glob';
import { createPipeline } from './pipeline';
import type { Processor } from 'unified';
import { buildUrl } from '@estrivault/cloudinary-utils';
import { getBaseNameWithoutExtension, resolvePath } from './utils/path-utils';
import {
  PostMeta,
  PostHTML,
  ProcessorOptions,
  ListOptions,
  FileNotFoundError,
  FrontMatterError,
  MarkdownParseError,
} from './types';

/**
 * Markdown文字列を処理してHTMLとメタデータを返す
 * @param md Markdown文字列
 * @param opts 処理オプション
 * @returns HTML文字列とメタデータ
 */
export async function loadFromString(md: string, opts: ProcessorOptions = {}): Promise<PostHTML> {
  try {
    // Front-matterの抽出
    const { data, content } = matter(md);

    // 必須フィールドの検証
    if (!data.title) {
      throw new FrontMatterError('Front-matterにtitleが含まれていません');
    }

    // publishedAt がなければ現在時刻を設定
    if (!data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }

    // 読了時間の計算
    const stats = readingTime(content);

    // Markdownの処理
    const processor = createPipeline(opts) as Processor;
    const result = await processor.process(content);

    // メタデータの構築
    const meta: PostMeta = {
      slug: data.slug || '',
      title: data.title,
      description: data.description || '',
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt || data.publishedAt,
      category: data.category || '',
      tags: data.tags || [],
      coverImage: resolveCoverImage(data.coverImage, opts.cloudinaryCloudName),
      draft: data.draft || false,
      readingTime: Math.ceil(stats.minutes),
    };

    return {
      meta,
      html: String(result),
    };
  } catch (error) {
    if (error instanceof FrontMatterError) {
      throw error;
    }
    let msg = '';
    if (error instanceof Error) {
      msg = error.message;
    } else {
      msg = String(error);
    }
    throw new MarkdownParseError(`Markdownの処理中にエラーが発生しました: ${msg}`);
  }
}

/**
 * Markdownファイルを読み込み、処理してHTMLとメタデータを返す
 * @param filePath Markdownファイルのパス
 * @param opts 処理オプション
 * @returns HTML文字列とメタデータ
 */
export async function loadFromFile(
  filePath: string,
  opts: ProcessorOptions = {}
): Promise<PostHTML> {
  console.log(`[loadFromFile] Loading file: ${filePath}`);
  
  try {
    // ファイルの存在確認
    try {
      await fs.access(filePath);
      console.log(`[loadFromFile] File exists: ${filePath}`);
    } catch (error) {
      console.error(`[loadFromFile] File not found: ${filePath}`, error);
      throw new FileNotFoundError(`ファイルが見つかりません: ${filePath}`);
    }
    
    // ファイルの読み込み
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`[loadFromFile] File read successfully: ${filePath} (${content.length} bytes)`);

    // 文字列処理関数に委譲
    console.log(`[loadFromFile] Processing content with options:`, opts);
    const result = await loadFromString(content, opts);
    console.log(`[loadFromFile] Content processed successfully`);
    return result;
  } catch (error) {
    if (
      error instanceof FileNotFoundError ||
      error instanceof FrontMatterError ||
      error instanceof MarkdownParseError
    ) {
      throw error;
    }
    let msg = '';
    if (error instanceof Error) {
      msg = error.message;
    } else {
      msg = String(error);
    }
    throw new Error(`ファイルの処理中にエラーが発生しました: ${msg}`);
  }
}

/**
 * 指定されたパターンに一致するMarkdownファイルからメタデータ一覧を取得
 * @param globPattern globパターン（単一または配列）
 * @param opts 一覧取得オプション
 * @returns メタデータ一覧
 */
export async function getAllPosts(
  globPattern: string | string[],
  opts: ListOptions = {}
): Promise<PostMeta[]> {
  // デフォルト値の設定
  const {
    page = 1,
    perPage = 20,
    sort = 'publishedAt',
    filter = () => true,
    baseDir = process.cwd(),
    ...restOpts
  } = opts;

  // 残りのオプションを処理オプションにマージ
  const processorOpts: ProcessorOptions = {
    ...restOpts,
    baseDir,
  };

  // ファイル一覧の取得（サブディレクトリも再帰的に検索）
  const files = await glob(globPattern, {
    cwd: baseDir,
    absolute: true,
    nodir: true,
  });

  // ファイルのみ抽出（ディレクトリは除外）
  const validFiles = (
    await Promise.all(
      files.map(async (f) => {
        try {
          const stat = await fs.stat(f);
          return stat.isFile() ? f : null;
        } catch {
          return null;
        }
      })
    )
  ).filter((f): f is string => !!f);

  // 各ファイルからメタデータを抽出
  const posts = await Promise.all(
    validFiles.map(async (file) => {
      try {
        const { meta } = await loadFromFile(file, processorOpts);
        return meta;
      } catch (error) {
        console.warn(`ファイルのメタデータ抽出中にエラー: ${file}`, error);
        return null;
      }
    })
  );

  // nullを除外し、フィルタを適用
  const validPosts = posts.filter((post): post is PostMeta => post !== null).filter(filter);

  // ソート
  const sortedPosts = [...validPosts].sort((a, b) => {
    if (sort === 'publishedAt') {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    } else if (sort === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // ページネーション
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  return sortedPosts.slice(startIndex, endIndex);
}

/**
 * 指定されたslugに一致するMarkdownファイルを処理してHTMLとメタデータを返す
 * @param slug 検索するslug
 * @param baseDir 基準ディレクトリ
 * @param opts 処理オプション
 * @returns HTML文字列とメタデータ
 */
export async function getPostBySlug(
  slug: string,
  baseDir: string,
  opts: ProcessorOptions = {}
): Promise<PostHTML> {
  // スラッグを正規化（先頭のスラッシュを削除）
  const normalizedSlug = slug.startsWith('/') ? slug.slice(1) : slug;

  // すべての記事を取得
  const allPosts = await getAllPosts('**/*.{md,mdx}', {
    ...opts,
    baseDir,
    perPage: Number.MAX_SAFE_INTEGER,
    sort: 'publishedAt', // 明示的にソート順を指定
  });

  console.log(`[getPostBySlug] Searching for slug: ${normalizedSlug}`);

  // スラッグに一致する記事を検索
  const postMeta = allPosts.find((post) => post.slug === normalizedSlug);

  if (!postMeta) {
    console.error(`[getPostBySlug] Slug not found: ${normalizedSlug}`);
    console.log(`[getPostBySlug] Available slugs:`, allPosts.map((p) => p.slug));
    throw new FileNotFoundError(`Slug not found: ${normalizedSlug}`);
  }

  // content/blog 配下のすべてのマークダウンファイルを検索
  const allMarkdownFiles = await glob('content/blog/**/*.{md,mdx}', {
    cwd: process.cwd(),
    absolute: true,
    nodir: true,
  });

  console.log(`[getPostBySlug] Found ${allMarkdownFiles.length} markdown files`);

  // 各ファイルを順番にチェック
  for (const filePath of allMarkdownFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(content);
      
      if (data.slug === normalizedSlug) {
        console.log(`[getPostBySlug] Found matching slug in file: ${filePath}`);
        return await loadFromFile(filePath, { ...opts, baseDir });
      }
    } catch (error) {
      console.warn(`[getPostBySlug] Error processing file ${filePath}:`, error);
      continue;
    }
  }

  throw new FileNotFoundError(`File not found for slug: ${normalizedSlug}`);
}

/**
 * 画像のURLをCloudinaryのURLに変換する
 * @param coverImage 画像のURLまたは相対パス
 * @param cloudinaryCloudName Cloudinaryクラウド名
 * @returns CloudinaryのURL
 */
function resolveCoverImage(coverImage?: string, cloudinaryCloudName: string = ''): string {
  if (!coverImage) return '';
  if (coverImage.startsWith('http') || coverImage.startsWith('data:')) return coverImage;
  // 先頭スラッシュ除去・拡張子除去
  let publicId = coverImage.replace(/^\//, '').replace(/\.[^/.]+$/, '');
  return buildUrl(cloudinaryCloudName, publicId, { w: 800 });
}

// 型定義のエクスポート
export * from './types';
