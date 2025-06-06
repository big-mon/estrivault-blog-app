import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root } from 'hast';
import type { VFile } from 'vfile';

interface LinkTransformOptions {
  /** 内部リンク判定関数 */
  internalPredicate?: (url: string) => boolean;
}

/**
 * 外部リンクに target="_blank" rel="noopener noreferrer" を自動付与するrehypeプラグイン
 */
export const rehypeLinkTransform: Plugin<[LinkTransformOptions?], Root, Root> = (
  options: LinkTransformOptions = {}
) => {
  const internalPredicate =
    options.internalPredicate || ((url: string) => url.startsWith('/') || url.startsWith('#'));

  const transformer: Transformer<Root, Root> = (tree: Root, file?: VFile) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a' || !node.properties) return;

      const href = node.properties.href;
      if (typeof href !== 'string') return;

      // 外部リンクの場合に属性を追加
      if (!internalPredicate(href)) {
        node.properties = {
          ...node.properties,
          target: '_blank',
          rel: 'noopener noreferrer',
        };
      }
    });

    return tree;
  };

  return transformer;
};
