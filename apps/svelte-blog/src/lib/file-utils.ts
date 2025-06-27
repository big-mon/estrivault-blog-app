import {
  processMarkdown,
  extractMetadata,
  type PostMeta,
  type PostHTML,
  type ProcessorOptions,
} from '@estrivault/content-processor';

export interface PostWithPath {
  meta: PostMeta;
  filePath: string;
}

/**
 * import.meta.globを使用してMarkdownファイルを静的に取得（メタデータ用）
 * @returns ファイルパスとコンテンツのマップ
 */
function getMarkdownFiles(): Record<string, string> {
  // Vite alias を使用したパス
  const modules = import.meta.glob('@content/blog/**/*.{md,mdx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  return modules as Record<string, string>;
}

/**
 * ファイルパスからスラッグを生成
 * @param filePath ファイルパス
 * @returns スラッグ
 */
function generateSlugFromPath(filePath: string): string {
  // ../../content/blog/category/2021-01-01-title.md -> 2021-01-01-title
  const pathParts = filePath.split('/');
  const filename = pathParts[pathParts.length - 1];
  if (!filename) {
    return '';
  }
  return filename.replace(/\.(md|mdx)$/, '');
}

/**
 * フロントマターのみを効率的に抽出してメタデータを取得
 * @param filePath ファイルパス
 * @param content ファイルコンテンツ
 * @param options 処理オプション
 * @returns メタデータのみ
 */
async function extractFrontmatterOnly(
  filePath: string,
  content: string,
  options: ProcessorOptions = {},
): Promise<PostWithPath | null> {
  try {
    // フロントマター部分のみを抽出（コンテンツ処理はスキップ）
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    const slug = generateSlugFromPath(filePath);
    // extractMetadata は軽量なのでそのまま使用
    const meta = await extractMetadata(content, options, slug);

    // ドラフトは除外
    if (meta.draft) {
      return null;
    }

    return { meta, filePath };
  } catch (error) {
    console.warn(`Failed to extract frontmatter from: ${filePath}`, error);
    return null;
  }
}

/**
 * 全Markdownファイルのメタデータを取得（最適化版）
 * @param options ファイル処理オプション
 * @returns PostMetaの配列（新しい順でソート済み）
 */
export async function getAllPostsMetaStatic(options: ProcessorOptions = {}): Promise<PostMeta[]> {
  const markdownFiles = getMarkdownFiles();

  const postsWithPath = await Promise.all(
    Object.entries(markdownFiles).map(([filePath, content]) =>
      extractFrontmatterOnly(filePath, content, options),
    ),
  );

  // nullを除外し、メタデータのみを抽出
  const validPosts = postsWithPath.filter((post): post is PostWithPath => post !== null);
  const posts = validPosts.map((post) => post.meta);

  // 投稿日の新しい順でソート（Date型なので直接比較）
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return posts;
}

/**
 * ファイルパス付きで全Markdownファイルのメタデータを取得（静的版）
 * @param options ファイル処理オプション
 * @returns PostWithPathの配列
 */
export async function getAllPostsWithPathStatic(
  options: ProcessorOptions = {},
): Promise<PostWithPath[]> {
  const markdownFiles = getMarkdownFiles();

  const postsWithPath = await Promise.all(
    Object.entries(markdownFiles).map(([filePath, content]) =>
      extractFrontmatterOnly(filePath, content, options),
    ),
  );

  // nullを除外
  return postsWithPath.filter((post): post is PostWithPath => post !== null);
}

/**
 * スラッグに基づいて個別の記事を取得（最適化版 - 遅延読み込み）
 * @param slug 記事のスラッグ
 * @param options ファイル処理オプション
 * @returns 記事のメタデータとHTMLコンテンツ
 */
export async function getPostBySlugStatic(
  slug: string,
  options: ProcessorOptions = {},
): Promise<PostHTML | null> {
  const markdownFiles = getMarkdownFiles();

  // スラッグに一致するファイルを検索
  for (const [filePath, content] of Object.entries(markdownFiles)) {
    try {
      // メタデータを抽出してスラッグを確認
      const meta = await extractMetadata(content, options, generateSlugFromPath(filePath));

      // フロントマターのslugまたはファイル名から生成されたslugが一致するかチェック
      if (meta.slug === slug) {
        // HTML変換して返却
        const postHTML = await processMarkdown(content, options, slug);
        // originalPathを設定（content/blog/から始まる相対パスに変換）
        const relativePath = filePath.replace(/^.*\/content\/blog\//, 'content/blog/');
        postHTML.originalPath = relativePath;
        return postHTML;
      }
    } catch (error) {
      // エラーのあるファイルはスキップ
      console.warn(`Failed to process file ${filePath}:`, error);
      continue;
    }
  }

  return null;
}

/**
 * 単一のファイルから完全なPostHTMLを取得（静的版）
 * @param filePath ファイルパス（完全パス）
 * @param options 処理オプション
 * @returns PostHTML
 */
export async function loadPostStatic(
  filePath: string,
  options: ProcessorOptions = {},
): Promise<PostHTML | null> {
  const markdownFiles = getMarkdownFiles();
  const content = markdownFiles[filePath];

  if (!content) {
    return null;
  }

  const slug = generateSlugFromPath(filePath);

  try {
    const postHTML = await processMarkdown(content, options, slug);
    // originalPathを設定（content/blog/から始まる相対パスに変換）
    const relativePath = filePath.replace(/^.*\/content\/blog\//, 'content/blog/');
    postHTML.originalPath = relativePath;
    return postHTML;
  } catch (error) {
    console.error(`Failed to process markdown for path: ${filePath}`, error);
    return null;
  }
}
