import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Image } from 'mdast';
import { buildUrl } from '@estrivault/cloudinary-utils';

export interface ImageTransformOptions {
  /** Cloudinaryクラウド名（必須） */
  cloudinaryCloudName: string;
  /** 画像幅 */
  width?: number;
  /** 画像品質 */
  quality?: number;
}

/**
 * 相対画像パスをCloudinary CDN URLに変換するremarkプラグイン
 */
export const remarkImageTransform: Plugin<[ImageTransformOptions], Root, Root> = (options) => {
  const { cloudinaryCloudName, width = 800 } = options;

  return (tree: Root) => {
    visit(tree, 'image', (node: Image) => {
      const url = node.url;

      // 相対パスの場合のみ変換
      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
        try {
          // 拡張子を除いたパス部分を取得
          let publicId = url.replace(/^\//, '').replace(/\.[^/.]+$/, '');

          // Cloudinary URLを生成
          node.url = buildUrl(cloudinaryCloudName, publicId, {
            w: width,
            mode: 'fit', // アスペクト比を維持
          });
        } catch (error) {
          console.error('Error transforming image URL:', error);
          // エラーが発生した場合は元のURLを維持
        }
      }
    });
    return tree;
  };
};
