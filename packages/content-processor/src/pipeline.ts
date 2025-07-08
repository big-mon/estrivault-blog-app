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
import { remarkDirectiveBoxes } from './plugins/embeds/directive-boxes';
import type { ProcessorOptions } from './types';

/**
 * MarkdownコンテンツをHTMLへ変換するための統合パイプラインを構築する。
 *
 * remark・rehypeエコシステムの各種プラグインを組み合わせ、埋め込みコンテンツや画像変換、リンク変換、見出し抽出、シンタックスハイライト（任意）などを一括で処理するパイプラインを生成する。
 *
 * @param options - Cloudinaryのクラウド名などを含む処理オプション
 * @param enableSyntaxHighlight - シンタックスハイライトを有効化する場合はtrue
 * @returns MarkdownからHTMLへの変換処理を行うunifiedパイプライン
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
    .use(remarkDirectiveBoxes)

    // HTML 変換
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw);

  // シンタックスハイライトを条件で追加（Cloudflare Workers対応）
  if (enableSyntaxHighlight) {
    pipeline.use(rehypePrettyCode, {
      theme: 'github-dark',
      keepBackground: false,
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
