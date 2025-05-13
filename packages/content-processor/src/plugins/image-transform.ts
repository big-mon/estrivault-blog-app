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
        const pathWithoutExt = url.replace(/\.[^/.]+$/, '');
        
        // Cloudinary URL形式に変換
        node.url = `${baseUrl}/${pathWithoutExt}?w=${width}&q=${quality}`;
      }
    });
  };
};
