import fs from 'fs/promises';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { glob } from 'glob';
import { createPipeline } from './pipeline/pipeline';
import type { Processor } from 'unified';
import { buildUrl } from '@estrivault/cloudinary-utils';
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

    // パイプラインの作成
    const pipeline = createPipeline(opts);

    // Markdownの処理
    const result = await pipeline.process(md);
    const html = result.toString() as string;

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
  try {
    // ファイルの存在確認
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new FileNotFoundError(`ファイルが見つかりません: ${filePath}`);
    }

    // ファイルの読み込み
    const content = await fs.readFile(filePath, 'utf-8');

    // 文字列処理関数に委譲
    const result = await loadFromString(content, opts);

    // フロントマターにslugが必須の場合はここでバリデーション
    if (!result.meta.slug) {
      throw new FrontMatterError('Front-matterにslugが指定されていません');
    }

    return result;
  } catch (error) {
    if (
      error instanceof FileNotFoundError ||
      error instanceof FrontMatterError ||
      error instanceof MarkdownParseError
    ) {
      throw error;
    }
    throw new MarkdownParseError(`ファイルの処理中にエラーが発生しました: ${filePath}`);
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
  } = opts;

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
        const { meta } = await loadFromFile(file, opts);
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
 * @param slug ファイル名（拡張子なし）
 * @param baseDir 基準ディレクトリ
 * @param opts 処理オプション
 * @returns HTML文字列とメタデータ
 */
export async function getPostBySlug(
  slug: string,
  baseDir: string,
  opts: ProcessorOptions = {}
): Promise<PostHTML> {
  // ディレクトリを再帰的に検索
  const files = await glob([`${baseDir}/**/*.{md,mdx}`], { nodir: true });

  for (const file of files) {
    try {
      const post = await loadFromFile(file, opts);
      // ファイルのフロントマターのslugと一致するか確認
      if (post.meta.slug === slug) {
        return post;
      }
    } catch (error) {
      // エラーが発生した場合は次のファイルを試す
      continue;
    }
  }

  throw new FileNotFoundError(`File not found with slug: ${slug}`);
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

// 型定義と関数のエクスポート
export * from './types';
export { createPipeline, createProcessor } from './pipeline/pipeline';
