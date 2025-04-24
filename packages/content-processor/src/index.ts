import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { glob } from 'glob';
import { createProcessor } from './pipeline';
import {
  PostMeta,
  PostHTML,
  ProcessorOptions,
  ListOptions,
  FileNotFoundError,
  FrontMatterError,
  MarkdownParseError
} from './types';

/**
 * Markdown文字列を処理してHTMLとメタデータを返す
 * @param md Markdown文字列
 * @param opts 処理オプション
 * @returns HTML文字列とメタデータ
 */
export async function loadFromString(
  md: string,
  opts: ProcessorOptions = {}
): Promise<PostHTML> {
  try {
    // Front-matterの抽出
    const { data, content } = matter(md);
    
    // 必須フィールドの検証
    if (!data.title) {
      throw new FrontMatterError('Front-matterにtitleが含まれていません');
    }
    if (!data.publishedAt) {
      throw new FrontMatterError('Front-matterにpublishedAtが含まれていません');
    }

    // 読了時間の計算
    const stats = readingTime(content);
    
    // Markdownの処理
    const processor = createProcessor(opts);
    const result = await processor.process(content);
    
    // メタデータの構築
    const meta: PostMeta = {
      slug: data.slug || '',
      title: data.title,
      description: data.description || '',
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
      category: data.category || '',
      tags: data.tags || [],
      coverImage: data.coverImage || data.thumbnail,
      draft: data.draft || false,
      readingTime: Math.ceil(stats.minutes)
    };
    
    return {
      meta,
      html: String(result)
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
    
    // ファイル読み込み
    const content = await fs.readFile(filePath, 'utf-8');
    
    // slugの抽出（ファイル名から拡張子を除いたもの）
    const basename = path.basename(filePath);
    const slug = basename.replace(/\.[^/.]+$/, '');
    
    // 文字列処理関数に委譲
    const result = await loadFromString(content, opts);
    
    // slugが指定されていない場合はファイル名から設定
    if (!result.meta.slug) {
      result.meta.slug = slug;
    }
    
    return result;
  } catch (error) {
    if (error instanceof FileNotFoundError || 
        error instanceof FrontMatterError || 
        error instanceof MarkdownParseError) {
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
    filter = () => true
  } = opts;
  
  // ファイル一覧の取得
  const files = await glob(globPattern);

  // ファイルのみ抽出（ディレクトリは除外）
  const validFiles = (await Promise.all(
    files.map(async (f) => {
      try {
        const stat = await fs.stat(f);
        return stat.isFile() ? f : null;
      } catch {
        return null;
      }
    })
  )).filter((f): f is string => !!f);

  // 各ファイルからメタデータを抽出
  const posts = await Promise.all(
    validFiles.map(async (file) => {
      try {
        const { meta } = await loadFromFile(file);
        return meta;
      } catch (error) {
        console.warn(`ファイルのメタデータ抽出中にエラー: ${file}`, error);
        return null;
      }
    })
  );
  
  // nullを除外し、フィルタを適用
  const validPosts = posts
    .filter((post): post is PostMeta => post !== null)
    .filter(filter);
  
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
  // .mdファイルを探す
  const filePath = path.join(baseDir, `${slug}.md`);
  
  try {
    return await loadFromFile(filePath, opts);
  } catch (error) {
    if (error instanceof FileNotFoundError) {
      // .mdxファイルも試す
      const mdxPath = path.join(baseDir, `${slug}.mdx`);
      try {
        return await loadFromFile(mdxPath, opts);
      } catch (mdxError) {
        throw error; // 元のエラーを投げる
      }
    }
    throw error;
  }
}

// 型定義のエクスポート
export * from './types';
