import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { remarkImageTransform, type ImageTransformOptions } from '../plugins/image-transform';
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

  // 画像変換オプション
  const imageTransformOptions: ImageTransformOptions = {
    cloudinaryCloudName: cloudinaryCloudName || '',
    width: 1200,
    quality: 80,
  };

  // 1つのチェーンで全てのプラグインを適用
  return (
    unified()
      // Markdown パース
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkGfm)

      // 画像変換 (remarkRehypeの前に適用)
      .use(remarkImageTransform, imageTransformOptions)

      // 埋め込みコンテンツ
      .use(remarkYoutubeEmbed)
      .use(remarkTwitterEmbed)
      .use(remarkGithubEmbed)

      // HTML 変換
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)

      // リンク変換
      .use(rehypeLinkTransform)

      // 最終出力
      .use(rehypeStringify)
  );
}

/**
 * Markdownをパースし、HTMLに変換するパイプラインを構築する
 * @deprecated 新しい `createPipeline` 関数を使用してください
 * @param options 処理オプション
 * @returns unified処理パイプライン
 */
/**
 * @deprecated 新しい `createPipeline` 関数を使用してください
 */
export const createProcessor = createPipeline;
