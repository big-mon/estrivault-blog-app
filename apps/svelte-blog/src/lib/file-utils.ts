import path from 'path';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { 
  processMarkdown, 
  extractMetadata, 
  type PostMeta, 
  type PostHTML, 
  type ProcessorOptions 
} from '@estrivault/content-processor';

export interface FileWalkOptions extends ProcessorOptions {
  baseDir?: string;
}

export interface PostWithPath {
  meta: PostMeta;
  filePath: string;
}

/**
 * ディレクトリを再帰的に探索してMarkdownファイルのパスを取得
 * @param options ファイル探索オプション
 * @returns Markdownファイルのパス一覧
 */
async function findMarkdownFiles(options: FileWalkOptions = {}): Promise<string[]> {
  const baseDir = options.baseDir || path.resolve(process.cwd(), '../../content/blog');
  const files: string[] = [];

  async function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  await walk(baseDir);
  return files;
}

/**
 * 単一のMarkdownファイルを読み込んでメタデータを抽出
 * @param filePath ファイルパス
 * @param options 処理オプション
 * @returns ファイルパス付きのPostMeta
 */
async function loadMarkdownMeta(filePath: string, options: FileWalkOptions = {}): Promise<PostWithPath | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const slug = path.basename(filePath, path.extname(filePath));
    const meta = await extractMetadata(content, options, slug);
    
    // ドラフトは除外
    if (meta.draft) {
      return null;
    }
    
    return { meta, filePath };
  } catch (error) {
    // 無効なファイルはスキップ
    console.warn(`Failed to load markdown file: ${filePath}`, error);
    return null;
  }
}

/**
 * 全Markdownファイルのメタデータを取得
 * @param options ファイル探索オプション
 * @returns PostMetaの配列（新しい順でソート済み）
 */
export async function getAllPostsMeta(options: FileWalkOptions = {}): Promise<PostMeta[]> {
  const filePaths = await findMarkdownFiles(options);
  const postsWithPath = await Promise.all(
    filePaths.map(filePath => loadMarkdownMeta(filePath, options))
  );
  
  // nullを除外し、メタデータのみを抽出
  const posts = postsWithPath
    .filter((post): post is PostWithPath => post !== null)
    .map(post => post.meta);
  
  // 投稿日の新しい順でソート
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return posts;
}

/**
 * ファイルパス付きで全Markdownファイルのメタデータを取得
 * @param options ファイル探索オプション
 * @returns PostWithPathの配列
 */
export async function getAllPostsWithPath(options: FileWalkOptions = {}): Promise<PostWithPath[]> {
  const filePaths = await findMarkdownFiles(options);
  const postsWithPath = await Promise.all(
    filePaths.map(filePath => loadMarkdownMeta(filePath, options))
  );
  
  // nullを除外
  return postsWithPath.filter((post): post is PostWithPath => post !== null);
}

/**
 * スラッグに基づいて個別の記事を取得
 * @param slug 記事のスラッグ
 * @param options ファイル探索オプション
 * @returns 記事のメタデータとHTMLコンテンツ
 */
export async function getPostBySlug(slug: string, options: FileWalkOptions = {}): Promise<PostHTML | null> {
  const postsWithPath = await getAllPostsWithPath(options);
  
  // スラッグに一致する投稿を検索
  const postWithPath = postsWithPath.find(post => post.meta.slug === slug);
  
  if (!postWithPath) {
    return null;
  }
  
  try {
    // ファイル内容を読み込んでHTML変換
    const content = await readFile(postWithPath.filePath, 'utf-8');
    return await processMarkdown(content, options, slug);
  } catch (error) {
    console.error(`Failed to process markdown for slug: ${slug}`, error);
    return null;
  }
}

/**
 * 単一のファイルから完全なPostHTMLを取得
 * @param filePath ファイルパス
 * @param options 処理オプション
 * @returns PostHTML
 */
export async function loadPost(filePath: string, options: FileWalkOptions = {}): Promise<PostHTML> {
  const resolvedPath = resolve(options.baseDir || process.cwd(), filePath);
  const content = await readFile(resolvedPath, 'utf-8');
  const slug = path.basename(filePath, path.extname(filePath));
  
  return await processMarkdown(content, options, slug);
}