import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Link } from 'mdast';

interface LinkTransformOptions {
  /** 内部リンク判定関数 */
  internalPredicate?: (url: string) => boolean;
}

/**
 * 外部リンクに target="_blank" rel="noopener noreferrer" を自動付与するremarkプラグイン
 */
export const remarkLinkTransform: Plugin<[LinkTransformOptions?], any> = (options = {}) => {
  const internalPredicate = options.internalPredicate || 
    ((url: string) => url.startsWith('/') || url.startsWith('#'));

  return (tree) => {
    visit(tree, 'link', (node: Link) => {
      const url = node.url;
      
      // 内部リンクでない場合、属性を追加
      if (!internalPredicate(url)) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        
        Object.assign(node.data.hProperties, {
          target: '_blank',
          rel: 'noopener noreferrer'
        });
      }
    });
  };
};
