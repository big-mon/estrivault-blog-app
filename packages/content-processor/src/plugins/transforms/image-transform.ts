import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'hast';
import { buildUrl, type BuildUrlOptions } from '@estrivault/cloudinary-utils';

export interface ImageTransformOptions {
  /** Cloudinaryクラウド名（必須） */
  cloudinaryCloudName: string;
  /** 画像幅 */
  width?: number;
  /** 画像のトリミングモード */
  mode?: 'fit' | 'fill';
}

/**
 * 画像パスをCloudinary CDN URLに変換するrehypeプラグイン
 */
export const rehypeImageTransform: Plugin<[ImageTransformOptions?], Root, Root> = (options) => {
  if (!options?.cloudinaryCloudName) {
    throw new Error('cloudinaryCloudName is required in options');
  }
  const { cloudinaryCloudName, width = 1200 } = options;

  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || !node.properties) {
        return undefined;
      }

      const src = node.properties.src;
      if (typeof src !== 'string' || !src) {
        return undefined;
      }

      // すでに絶対URLまたはデータURLの場合はスキップ
      if (src.startsWith('http') || src.startsWith('data:')) {
        return undefined;
      }

      try {
        // 拡張子を除いたパス部分を取得
        const publicId = src.replace(/^\//, '').split('.')[0];

        if (!publicId) {
          return undefined;
        }

        // Cloudinary URLを生成
        const mode =
          (node.properties['data-mode'] as string) === 'fill' ?
            ('fill' as const)
          : ('fit' as const);
        const buildOptions: BuildUrlOptions = {
          w: width,
          mode,
        };

        node.properties.src = buildUrl(cloudinaryCloudName, publicId, buildOptions);

        // レスポンシブ画像用の属性を追加
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';

        // サイズヒントを追加
        if (!node.properties.sizes) {
          node.properties.sizes = '(max-width: 768px) 100vw, 50vw';
        }
      } catch (error) {
        console.error('Error transforming image URL:', error);
        // エラーが発生した場合は元のURLを維持
      }
      return undefined;
    });

    return tree;
  };
};

// 後方互換性のため
/**
 * @deprecated 代わりに `rehypeImageTransform` を使用してください
 */
export const remarkImageTransform = rehypeImageTransform;
