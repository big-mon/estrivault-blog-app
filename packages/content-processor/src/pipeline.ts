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
import { hasCodeBlocks } from './utils/code-detector';
import type { ProcessorOptions } from './types';
import type { Root } from 'mdast';

/**
 * パイプラインを構築する（コードブロック有り）
 * @param options 処理オプション
 * @returns 構築されたパイプライン
 */
export function createPipelineWithCode(options: ProcessorOptions = {}) {
  const { cloudinaryCloudName } = options;

  return unified()
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
    .use(rehypeRaw)

    // シンタックスハイライト
    .use(rehypePrettyCode, {
      theme: {
        dark: 'github-dark',
        light: 'github-light'
      },
      keepBackground: false
    })

    // 画像変換 (HTML 変換後)
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
    .use(rehypeStringify);
}

/**
 * パイプラインを構築する（コードブロック無し）
 * @param options 処理オプション
 * @returns 構築されたパイプライン
 */
export function createPipelineWithoutCode(options: ProcessorOptions = {}) {
  const { cloudinaryCloudName } = options;

  return unified()
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
    .use(rehypeRaw)

    // 画像変換 (HTML 変換後)
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
    .use(rehypeStringify);
}

/**
 * パイプラインを構築する（従来の互換性のため）
 * @param options 処理オプション
 * @returns 構築されたパイプライン
 */
export function createPipeline(options: ProcessorOptions = {}) {
  // デフォルトではコードブロック有りのパイプラインを返す
  return createPipelineWithCode(options);
}
