import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Element, Root } from 'hast';

const TABLE_CLASS_NAMES = ['adsense-exclude-area', 'google-anno-skip'];

/**
 * tableタグに広告・アノテーション除外用のクラスを付与するrehypeプラグイン
 */
export const rehypeTableClass: Plugin<[], Root, Root> = () => {
  const transformer: Transformer<Root, Root> = (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'table') {
        return undefined;
      }

      const existingClassName = node.properties?.className;
      const classNames =
        Array.isArray(existingClassName) ? existingClassName.map(String)
        : typeof existingClassName === 'string' ? existingClassName.split(/\s+/).filter(Boolean)
        : [];

      node.properties = {
        ...node.properties,
        className: [...new Set([...classNames, ...TABLE_CLASS_NAMES])],
      };

      return undefined;
    });

    return tree;
  };

  return transformer;
};
