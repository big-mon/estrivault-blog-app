import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root, Element } from 'hast';
import type { HeadingInfo } from '../../types';

/**
 * 見出しタグ(h1-h6)から見出し情報を抽出するrehypeプラグイン
 * パイプライン処理中に見出し情報を収集し、後で利用できるようにする
 */
export const rehypeHeadingExtractor: Plugin<[], Root, Root> = () => {
  const headings: HeadingInfo[] = [];

  const transformer: Transformer<Root, Root> = (tree: Root, file) => {
    visit(tree, 'element', (node: Element) => {
      // h1-h3タグのみ処理（深さ1段目まで）
      if (!node.tagName.match(/^h[1-3]$/)) return;

      // 見出しレベルを取得
      const level = parseInt(node.tagName[1]);

      // 見出しテキストを取得
      const text = getTextContent(node);
      if (!text) return;

      // id属性を取得（heading-anchorプラグインで設定されたもの）
      const id = node.properties?.id as string;
      if (!id) return;

      // 見出し情報を収集
      headings.push({
        id,
        level,
        text,
      });
    });

    // 見出し情報をfile.dataに保存（パイプライン後に参照可能）
    if (!file.data) file.data = {};
    file.data.headings = headings;

    return tree;
  };

  return transformer;
};

/**
 * 要素からテキストコンテンツを再帰的に取得
 * アンカーリンクは除外して見出しテキストのみを取得
 */
function getTextContent(node: Element): string {
  let text = '';

  for (const child of node.children) {
    if (child.type === 'text') {
      text += child.value;
    } else if (child.type === 'element') {
      // アンカーリンク要素は除外
      const className = child.properties?.className;
      if (Array.isArray(className) && className.includes('heading-anchor')) {
        continue;
      }
      text += getTextContent(child);
    }
  }

  return text.trim();
}
