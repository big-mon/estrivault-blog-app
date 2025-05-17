import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { ProcessorOptions } from '../types';
import { remarkLinkTransform } from '../plugins/link-transform';
import { remarkImageTransform } from '../plugins/image-transform';
import { remarkYoutubeEmbed } from '../plugins/youtube-embed';
import { remarkTwitterEmbed } from '../plugins/twitter-embed';
import { remarkGithubEmbed } from '../plugins/github-embed';
import { remarkAmazonEmbed } from '../plugins/amazon-embed';

/**
 * Markdownをパースし、HTMLに変換するパイプラインを構築する
 * @param options 処理オプション
 * @returns unified処理パイプライン
 */
export function createProcessor(options: ProcessorOptions = {}) {
  // 基本パイプライン
  let processor = unified()
    .use(remarkParse) // Markdownをパース
    .use(remarkDirective) // ::directive{} 構文を有効化
    .use(remarkLinkTransform) // 外部リンクに target="_blank" を追加
    .use(remarkImageTransform, { baseUrl: options.imageBase }) // 画像変換（Cloudinary対応）
    .use(remarkYoutubeEmbed) // YouTube埋め込み
    .use(remarkTwitterEmbed) // Twitter埋め込み
    .use(remarkGithubEmbed) // GitHub埋め込み
    .use(remarkAmazonEmbed) // Amazon埋め込み
    .use(remarkRehype) // rehypeに変換（生HTMLを許可）
    .use(rehypeRaw) // 生HTMLを処理
    .use(rehypeStringify); // HTML文字列に変換

  // HTMLサニタイズ
  if (options.sanitizeSchema) {
    processor = processor.use(rehypeSanitize, options.sanitizeSchema);
  } else {
    processor = processor.use(rehypeSanitize);
  }

  return processor;
}
