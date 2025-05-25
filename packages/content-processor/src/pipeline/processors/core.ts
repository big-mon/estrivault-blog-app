import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { PipelineProcessor } from '../types';

/**
 * コアなMarkdownパーサーを設定する
 */
export const createCoreProcessor: PipelineProcessor = (processor) => {
  return processor
    .use(remarkParse) // Markdownをパース
    .use(remarkDirective) // ::directive{} 構文を有効化
    .use(remarkGfm) // GitHub Flavored Markdown (テーブル、取り消し線など) をサポート
    .use(remarkRehype, { allowDangerousHtml: true }) // MarkdownをHTMLに変換
    .use(rehypeRaw) // HTMLをパースして再構築
    .use(rehypeStringify); // HTMLを文字列にシリアライズ
};

/**
 * HTMLサニタイズを設定する
 */
export const createSanitizeProcessor: PipelineProcessor = (processor, options) => {
  return options?.sanitizeSchema
    ? processor.use(rehypeSanitize, options.sanitizeSchema)
    : processor.use(rehypeSanitize);
};
