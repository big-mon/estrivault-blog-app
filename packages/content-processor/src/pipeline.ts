import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { rehypeImageTransform } from './plugins/transforms/image-transform';
import { rehypeLinkTransform } from './plugins/transforms/link-transform';
import { rehypeHeadingAnchor } from './plugins/transforms/heading-anchor';
import { remarkYoutubeEmbed } from './plugins/embeds/youtube-embed';
import { remarkTwitterEmbed } from './plugins/embeds/twitter-embed';
import { remarkGithubEmbed } from './plugins/embeds/github-embed';
import { remarkAmazonEmbed } from './plugins/embeds/amazon-embed';
import type { ProcessorOptions } from './types';

/**
 * パイプラインを構築する
 * @param options 処理オプション
 * @returns 構築されたパイプライン
 */
export function createPipeline(options: ProcessorOptions = {}) {
  const { cloudinaryCloudName } = options;

  // 1つのチェーンで全てのプラグインを適用
  return (
    unified()
      // Markdown パース
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkGfm)

      // 埋め込みコンテンツ
      .use(remarkYoutubeEmbed)
      .use(remarkTwitterEmbed)
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

      // 最終出力
      .use(rehypeStringify)
  );
}
