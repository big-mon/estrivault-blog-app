import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import type { Node } from 'unist';

interface TwitterEmbedOptions {
  onTwitterFound?: () => void;
}

/**
 * ::twitter{id="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkTwitterEmbed: Plugin<[TwitterEmbedOptions?], Root, Root> = (options = {}) => {
  return (tree) => {
    visit(tree, function (node: Node) {
      const isTargetType =
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective';

      if (!isTargetType || !('name' in node) || node.name !== 'twitter') {
        return undefined;
      }

      const nodeWithData = node as Node & {
        data?: Record<string, unknown>;
        attributes?: Record<string, string>;
        name: string;
        children?: Node[];
      };
      const data = nodeWithData.data || (nodeWithData.data = {});
      const attributes = nodeWithData.attributes || {};
      const id = attributes.id;

      if (!id) {
        console.warn('Twitter embed directive without id attribute');
        return undefined;
      }

      if (node.type === 'textDirective') {
        console.error(
          'Unexpected `:twitter` text directive, use two colons for a leaf directive',
          node,
        );
        return undefined;
      }

      // コールバックがあれば呼び出し
      if (options.onTwitterFound) {
        options.onTwitterFound();
      }

      // HTMLノードに変換 - blockquoteを直接作成
      data.hName = 'blockquote';
      data.hProperties = {
        className: ['twitter-tweet'],
        'data-theme': 'light',
        'data-width': '550',
        'data-dnt': 'true',
        'data-conversation': 'none',
      };

      // Twitterの正しいURL
      const tweetUrl = `https://twitter.com/i/status/${id}`;

      // blockquoteの子要素として適切なコンテンツを設定
      nodeWithData.children = [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Loading tweet...',
            } as Node,
          ],
        } as Node,
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: '— ',
            } as Node,
            {
              type: 'link',
              url: tweetUrl,
              children: [
                {
                  type: 'text',
                  value: `View on X`,
                } as Node,
              ],
            } as Node,
          ],
        } as Node,
      ];
      return undefined;
    });
  };
};
