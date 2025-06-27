import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import { rehypeImageTransform } from './plugins/transforms/image-transform';
import { rehypeLinkTransform } from './plugins/transforms/link-transform';
import { rehypeHeadingAnchor } from './plugins/transforms/heading-anchor';
import { rehypeHeadingExtractor } from './plugins/transforms/heading-extractor';
import { remarkYoutubeEmbed } from './plugins/embeds/youtube-embed';
import { remarkTwitterEmbed } from './plugins/embeds/twitter-embed';
import { remarkCommonLinkEmbed } from './plugins/embeds/common-link-embed';
import { remarkGithubEmbed } from './plugins/embeds/github-embed';
import { remarkAmazonEmbed } from './plugins/embeds/amazon-embed';
import type { ProcessorOptions } from './types';

/**
 * 共通のパイプライン基盤を構築する
 * @param options 処理オプション
 * @param enableSyntaxHighlight シンタックスハイライトを有効化するか
 * @returns ベースパイプライン
 */
function createBasePipeline(
  options: ProcessorOptions = {},
  enableSyntaxHighlight: boolean = false,
) {
  const { cloudinaryCloudName } = options;

  const pipeline = unified()
    // Markdown パース
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkGfm)

    // 埋め込みコンテンツ
    .use(remarkYoutubeEmbed)
    .use(remarkTwitterEmbed)
    .use(remarkCommonLinkEmbed)
    .use(remarkGithubEmbed)
    .use(remarkAmazonEmbed)

    // HTML 変換
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw);

  // シンタックスハイライトを条件で追加
  if (enableSyntaxHighlight) {
    pipeline.use(rehypePrettyCode, {
      theme: 'github-dark',
      keepBackground: false,
      langs: [
        'bash',
        'javascript',
        'typescript',
        'json',
        'svelte',
        'toml',
        'xml',
        'markdown',
        'text',
        'js',
      ],
    });
  }

  return (
    pipeline
      // 画像変換
      .use(rehypeImageTransform, {
        cloudinaryCloudName: cloudinaryCloudName || '',
        width: 1200,
        mode: 'fit',
      })

      // リンク変換
      .use(rehypeLinkTransform)

      // 見出しアンカー追加
      .use(rehypeHeadingAnchor)

      // 見出し情報抽出
      .use(rehypeHeadingExtractor)

      // 最終出力
      .use(rehypeStringify)
  );
}

/**
 * パイプラインを構築する
 * @param options 処理オプション
 * @param enableSyntaxHighlight シンタックスハイライトを有効化するか
 * @returns 構築されたパイプライン
 */
export function createPipeline(
  options: ProcessorOptions = {},
  enableSyntaxHighlight: boolean = false,
) {
  return createBasePipeline(options, enableSyntaxHighlight);
}
