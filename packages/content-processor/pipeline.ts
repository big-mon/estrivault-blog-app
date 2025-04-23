import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import matter from 'gray-matter';

export interface MarkdownProcessResult {
  html: string;
  data: Record<string, any>;
  content: string;
}

/**
 * Markdown→HTML変換パイプライン
 * @param markdown Markdownテキスト
 * @returns HTML・Frontmatter・Markdown本文
 */
export async function markdownToHtmlPipeline(markdown: string): Promise<MarkdownProcessResult> {
  // Front-matter抽出
  const { content, data } = matter(markdown);

  // unifiedパイプライン構築
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml', 'toml'])
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content);

  return {
    html: String(file),
    data,
    content,
  };
}
