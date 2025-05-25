import type { PipelineProcessor } from '../types';
import { remarkLinkTransform } from '../../plugins/link-transform';
import { remarkImageTransform, type ImageTransformOptions } from '../../plugins/image-transform';
import { remarkYoutubeEmbed } from '../../plugins/youtube-embed';
import { remarkTwitterEmbed } from '../../plugins/twitter-embed';
import { remarkGithubEmbed } from '../../plugins/github-embed';
import { remarkAmazonEmbed } from '../../plugins/amazon-embed';

/**
 * リンク変換プラグインを設定する
 */
export const createLinkTransformProcessor: PipelineProcessor = (processor) => {
  return processor.use(remarkLinkTransform);
};

/**
 * 画像変換プラグインを設定する
 * @throws {Error} cloudinaryCloudName が指定されていない場合にスロー
 */
export const createImageTransformProcessor: PipelineProcessor = (processor, options) => {
  if (!options?.cloudinaryCloudName) {
    throw new Error('cloudinaryCloudName is required for image transformation');
  }

  const transformOptions: ImageTransformOptions = {
    cloudinaryCloudName: options.cloudinaryCloudName,
    width: 1200, // デフォルトの画像幅
    quality: 80, // デフォルトの画質
  };

  return processor.use(remarkImageTransform, transformOptions);
};

/**
 * 埋め込みプラグインを設定する
 */
export const createEmbedProcessors: PipelineProcessor = (processor, options) => {
  if (options?.embeds?.youtube) {
    processor = processor.use(remarkYoutubeEmbed);
  }
  if (options?.embeds?.twitter) {
    processor = processor.use(remarkTwitterEmbed);
  }
  if (options?.embeds?.github) {
    processor = processor.use(remarkGithubEmbed);
  }
  if (options?.embeds?.amazon) {
    processor = processor.use(remarkAmazonEmbed);
  }
  return processor;
};
