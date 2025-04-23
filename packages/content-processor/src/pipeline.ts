import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import matter from 'gray-matter';
import { PostMeta, PostHTML, ProcessorOptions } from './types';

/**
 * Markdown→HTML変換パイプライン
 * @param markdown Markdownテキスト
 * @param options 追加オプション
 * @returns HTML・meta情報
 */
export async function markdownToHtmlPipeline(
  markdown: string,
  options?: ProcessorOptions
): Promise<PostHTML> {
  // Front-matter抽出
  const { content, data } = matter(markdown);

  // unifiedパイプライン構築
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml', 'toml'])
    .use(remarkRehype)
    .use(rehypeSanitize, options?.sanitizeSchema)
    .use(rehypeStringify)
    .process(content);

  // meta生成（PostMeta型に合わせて必要な項目を抽出・補完）
  const meta: PostMeta = {
    slug: data.slug || '',
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    publishedAt: data.publishedAt || '',
    category: data.category || '',
    tags: data.tags || [],
    coverImage: data.coverImage,
    draft: data.draft,
    readingTime: Math.ceil(content.split(/\s+/).length / 400), // 400wpm想定
  };

  return {
    meta,
    html: String(file),
  };
}

