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
    const internalPredicate = options.internalPredicate || ((url: string) => {
        // 空のリンクやフラグメントは内部リンク
        if (!url || url.startsWith('#')) return true;

        try {
          // URLとしてパース可能か試みる
          const parsedUrl = new URL(url, 'https://example.com');

          // 相対パスまたは同じオリジンの場合に内部リンクと判定
          return !parsedUrl.hostname || parsedUrl.hostname === 'example.com';
        } catch {
          // URLパースに失敗した場合は相対パスとみなして内部リンクとする
          return true;
        }
      });

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
