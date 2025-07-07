import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/**
 * :::info, :::alert, :::warn ディレクティブを HTML 要素に変換する remark プラグイン
 */
export const remarkDirectiveBoxes: Plugin<[], Root, Root> = () => {
  return (tree) => {
    visit(tree, function (node) {
      if (node.type !== 'containerDirective') return;

      const directiveType = node.name;
      if (!['info', 'alert', 'warn'].includes(directiveType)) return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const title = attributes.title;

      // ベースクラス名を設定
      const baseClass = `directive-box directive-${directiveType}`;

      const displayTitle = title;

      // HTML 要素として変換
      data.hName = 'div';
      data.hProperties = {
        className: [baseClass],
        'data-directive-type': directiveType,
      };

      // 子要素を再構築
      const originalChildren = node.children || [];
      const newChildren: typeof originalChildren = [];

      // カスタムタイトルがある場合のみタイトルを追加
      if (displayTitle) {
        newChildren.push({
          type: 'paragraph',
          children: [
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: displayTitle,
                },
              ],
            },
          ],
          data: {
            hProperties: {
              className: ['directive-title'],
            },
          },
        });
      }

      // 元のコンテンツをそのまま追加
      newChildren.push(...originalChildren);

      // アイコンはCSSの::before疑似要素で表示

      // 新しい子要素を設定
      node.children = newChildren;
    });
  };
};
