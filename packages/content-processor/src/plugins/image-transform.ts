import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Image } from 'mdast';

interface ImageTransformOptions {
  /** Cloudinary変換ベースURL */
  baseUrl?: string;
  /** 画像幅 */
  width?: number;
  /** 画像品質 */
  quality?: number;
}

/**
 * 相対画像パスをCloudinary CDN URLに変換するremarkプラグイン
 */
export const remarkImageTransform: Plugin<[ImageTransformOptions?], Root, Root> = (options = {}) => {
  const { baseUrl, width = 800, quality = 80 } = options;

  if (!baseUrl) {
    return (tree: Root) => tree; // baseUrlが指定されていない場合は何もしない
  }

  return (tree: Root) => {
    visit(tree, 'image', (node: Image) => {
      const url = node.url;

      // 相対パスの場合のみ変換
      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
        // 拡張子を除いたパス部分を取得
        let pathSegment = url.replace(/\.[^/.]+$/, '');

        // pathSegmentの先頭のスラッシュを除去
        if (pathSegment.startsWith('/')) {
          pathSegment = pathSegment.substring(1);
        }

        // baseUrlの末尾のスラッシュを除去 (もしあれば)
        let cleanedBaseUrl = baseUrl;
        if (cleanedBaseUrl.endsWith('/')) {
          cleanedBaseUrl = cleanedBaseUrl.slice(0, -1);
        }

        // Cloudinary URL形式に変換
        node.url = `${cleanedBaseUrl}/${pathSegment}?w=${width}&q=${quality}`;
      }
    });
    return tree; // 変更されたツリーまたは元のツリーを返す
  };
};
