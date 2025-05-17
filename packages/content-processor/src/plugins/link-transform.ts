import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root, Link } from 'mdast';
import type { VFile } from 'vfile';

interface LinkTransformOptions {
  /** 内部リンク判定関数 */
  internalPredicate?: (url: string) => boolean;
}

/**
 * 外部リンクに target="_blank" rel="noopener noreferrer" を自動付与するremarkプラグイン
 */
export const remarkLinkTransform: Plugin<[LinkTransformOptions?], Root, Root> = (
  options: LinkTransformOptions = {}
) => {
  const internalPredicate =
    options.internalPredicate || ((url: string) => url.startsWith('/') || url.startsWith('#'));

  const transformer: Transformer<Root, Root> = (tree: Root, file?: VFile) => {
    visit(tree, 'link', (node: Link) => {
      const url = node.url;

      // urlが存在し、かつ外部リンクである場合
      if (url && !internalPredicate(url)) {
        // 既存のプロパティを取得
        const existingProps = node.data?.hProperties || {};
        
        // 新しいプロパティをマージ
        node.data = node.data || {};
        node.data.hProperties = {
          ...existingProps,
          target: '_blank',
          rel: 'noopener noreferrer'
        };
      }
    });
    return tree; // 処理後のツリーを返す
  };

  return transformer;
};
