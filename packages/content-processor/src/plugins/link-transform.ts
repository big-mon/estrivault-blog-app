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
        if (!node.data) {
          node.data = {};
        }
        // hPropertiesを安全に扱う
        const hProperties = (node.data.hProperties || {}) as Record<string, unknown>;

        node.data.hProperties = {
          ...hProperties, // 既存のプロパティを維持
          target: '_blank',
          rel: 'noopener noreferrer',
        };
      }
    });
    return tree; // 処理後のツリーを返す
  };

  return transformer;
};
