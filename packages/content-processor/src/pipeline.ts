import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { Schema } from 'hast-util-sanitize';
import { ProcessorOptions } from './types';
import { remarkLinkTransform } from './plugins/link-transform';
import { remarkImageTransform } from './plugins/image-transform';
import { remarkYoutubeEmbed } from './plugins/youtube-embed';
import { remarkTwitterEmbed } from './plugins/twitter-embed';
import { remarkGithubEmbed } from './plugins/github-embed';
import { remarkAmazonEmbed } from './plugins/amazon-embed';

/**
 * Markdownをパースし、HTMLに変換するパイプラインを構築する
 * @param options 処理オプション
 * @returns unified処理パイプライン
 */
import type { Processor } from 'unified';
import type { Root } from 'remark-parse/lib';

export function createProcessor(options: ProcessorOptions = {}): Processor<Root, string, string, string, string> {
  // 基本パイプライン
  let processor = unified()
    .use(remarkParse) // Markdownをパース
    .use(remarkDirective) // ::directive{} 構文を有効化
    .use(remarkLinkTransform) // 外部リンクに target="_blank" を追加
    .use(remarkRehype, { allowDangerousHtml: true }) // rehypeに変換（生HTMLを許可）
    .use(rehypeRaw) // 生HTMLを処理
    .use(rehypeStringify); // HTML文字列に変換

  // 画像変換（Cloudinary対応）
  if (options.imageBase) {
    processor = processor.use(remarkImageTransform, { baseUrl: options.imageBase });
  }

  // 埋め込みプラグイン
  const embeds = options.embeds || {};
  if (embeds.youtube) {
    processor = processor.use(remarkYoutubeEmbed);
  }
  if (embeds.twitter) {
    processor = processor.use(remarkTwitterEmbed);
  }
  if (embeds.github) {
    processor = processor.use(remarkGithubEmbed);
  }
  if (embeds.amazon) {
    processor = processor.use(remarkAmazonEmbed);
  }

  // HTMLサニタイズ
  if (options.sanitizeSchema) {
    processor = processor.use(rehypeSanitize, options.sanitizeSchema);
  } else {
    processor = processor.use(rehypeSanitize);
  }

  return processor as Processor<Root, string, string, string, string>;
}
