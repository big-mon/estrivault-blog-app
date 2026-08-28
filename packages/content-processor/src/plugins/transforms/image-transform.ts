import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'hast';
import { buildUrl, buildSrcSet, type BuildUrlOptions } from '@estrivault/cloudinary-utils';

export interface ImageTransformOptions {
  /** Cloudinaryクラウド名（必須） */
  cloudinaryCloudName: string;
}

/**
 * 本文画像のURLをCloudinary CDN URLへ解決する。
 *
 * 絶対URLとデータURLは入力をそのまま返し、それ以外は既存のHTML変換と同じ
 * public IDおよび変換条件を使う。変換対象なのにクラウド名がない場合は、壊れた
 * 相対パスを公開しないよう明示的に失敗させる。
 */
export function resolveBodyImageUrl(
  src: string,
  cloudinaryCloudName: string | undefined,
  mode: 'fill' | 'fit' = 'fit',
): string {
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }

  const publicId = getBodyImagePublicId(src);
  if (!publicId) {
    return src;
  }

  const normalizedCloudinaryCloudName = cloudinaryCloudName?.trim();
  if (!normalizedCloudinaryCloudName) {
    throw new Error('cloudinaryCloudName is required for body image transformation');
  }

  return buildUrl(normalizedCloudinaryCloudName, publicId, {
    w: 1200,
    mode,
    quality: 90,
  });
}

function getBodyImagePublicId(src: string): string {
  return src.replace(/^\//, '').split('.')[0] ?? '';
}

/**
 * 画像パスをCloudinary CDN URLに変換するrehypeプラグイン
 */
export const rehypeImageTransform: Plugin<[ImageTransformOptions?], Root, Root> = (options) => {
  const { cloudinaryCloudName } = options || {};

  if (!cloudinaryCloudName?.trim()) {
    throw new Error('cloudinaryCloudName is required for rehypeImageTransform');
  }

  const normalizedCloudinaryCloudName = cloudinaryCloudName.trim();

  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'img' || !node.properties || !parent || index === undefined) {
        return undefined;
      }

      const src = node.properties.src;
      const title = node.properties.title;

      if (typeof src !== 'string' || !src) {
        return undefined;
      }

      // すでに絶対URLまたはデータURLの場合はスキップ
      if (src.startsWith('http') || src.startsWith('data:')) {
        return undefined;
      }

      try {
        // 拡張子を除いたパス部分を取得
        const publicId = getBodyImagePublicId(src);

        if (!publicId) {
          return undefined;
        }

        // Cloudinary URLを生成
        const mode =
          (node.properties['data-mode'] as string) === 'fill' ?
            ('fill' as const)
          : ('fit' as const);
        const buildOptions: BuildUrlOptions = {
          w: 1200,
          mode,
          quality: 90,
        };

        node.properties.src = resolveBodyImageUrl(src, normalizedCloudinaryCloudName, mode);

        // レスポンシブ画像用のsrcsetを生成
        node.properties.srcset = buildSrcSet(normalizedCloudinaryCloudName, publicId, buildOptions);

        // レスポンシブ画像用の属性を追加
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';

        // サイズヒントを追加（記事幅に最適化）
        if (!node.properties.sizes) {
          node.properties.sizes = '(max-width: 640px) 100vw, (max-width: 768px) 90vw, 800px';
        }

        // すべての画像をfigureで包む
        const figureChildren = [node];

        // titleがある場合、figcaptionも追加
        if (title && typeof title === 'string') {
          const figcaption = {
            type: 'element' as const,
            tagName: 'figcaption',
            properties: {},
            children: [{ type: 'text' as const, value: title }],
          };
          figureChildren.push(figcaption);

          // titleを削除（figcaptionに移動したため）
          delete node.properties.title;
        }

        const figure = {
          type: 'element' as const,
          tagName: 'figure',
          properties: {},
          children: figureChildren,
        };

        // 親要素内でimgをfigureに置き換え
        if (Array.isArray(parent.children)) {
          parent.children[index] = figure;
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
