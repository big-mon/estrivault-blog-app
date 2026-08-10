import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root } from 'hast';

/**
 * 外部リンクに target="_blank" rel="noopener noreferrer" を自動付与するrehypeプラグイン
 */
export const rehypeLinkTransform: Plugin<[], Root, Root> = () => {
  const isInternalLink = (url: string) => {
    // 空のリンクやフラグメントは内部リンク
    if (!url || url.startsWith('#')) return true;

    // 同一サイトのルート相対パス（プロトコル相対URLは除く）
    if (url.startsWith('/') && !url.startsWith('//')) return true;

    // 相対パス（./ または ../ で始まる）は内部リンク
    if (url.startsWith('./') || url.startsWith('../')) return true;

    // 完全なURLとプロトコル相対URLは外部リンク
    return false;
  };

  const transformer: Transformer<Root, Root> = (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a' || !node.properties) return;

      const href = node.properties.href;
      if (typeof href !== 'string') return;

      // 外部リンクの場合に属性を追加
      if (!isInternalLink(href)) {
        node.properties = {
          ...node.properties,
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        };
      }
    });

    return tree;
  };

  return transformer;
};
