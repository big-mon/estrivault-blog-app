import { unified, type Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { PipelineProcessor } from '../types';

/**
 * コアなMarkdownパーサーを設定する
 */
export const createCoreProcessor: PipelineProcessor = (processor) => {
  // @ts-ignore - unified の型定義が厳しすぎるため
  return processor
    .use(remarkParse) // Markdownをパース
    .use(remarkDirective) // ::directive{} 構文を有効化
    .use(remarkRehype) // rehypeに変換（生HTMLを許可）
    .use(rehypeRaw) // 生HTMLを処理
    .use(rehypeStringify); // HTML文字列に変換
};

/**
 * HTMLサニタイズを設定する
 */
export const createSanitizeProcessor: PipelineProcessor = (processor, options) => {
  // @ts-ignore - unified の型定義が厳しすぎるため
  return options?.sanitizeSchema
    ? processor.use(rehypeSanitize, options.sanitizeSchema)
    : processor.use(rehypeSanitize);
};
