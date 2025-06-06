import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { rehypeImageTransform } from '../plugins/image-transform';
import { rehypeLinkTransform } from '../plugins/link-transform';
import { remarkYoutubeEmbed } from '../plugins/youtube-embed';
import { remarkTwitterEmbed } from '../plugins/twitter-embed';
import { remarkGithubEmbed } from '../plugins/github-embed';
import type { ProcessorOptions as BaseProcessorOptions } from '../types';

/**
 * 拡張されたプロセッサーオプション
 */
interface ProcessorOptions extends BaseProcessorOptions {
  /** 画像変換用のCloudinaryクラウド名 */
  cloudinaryCloudName?: string;
}

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

      // HTML 変換
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)

      // 画像変換 (HTML 変換後)
      .use(rehypeImageTransform, {
        cloudinaryCloudName: cloudinaryCloudName || '',
        width: 1200,
        quality: 80,
        mode: 'fit',
      })

      // リンク変換
      .use(rehypeLinkTransform)

      // 最終出力
      .use(rehypeStringify)
  );
}
