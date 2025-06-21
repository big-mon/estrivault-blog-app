import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

interface TwitterEmbedOptions {
  onTwitterFound?: () => void;
}

/**
 * ::twitter{id="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkTwitterEmbed: Plugin<[TwitterEmbedOptions?], Root, Root> = (options = {}) => {
  return (tree) => {
    visit(tree, function (node: any) {
      const isTargetType =
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective';

      if (!isTargetType || node.name !== 'twitter') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const id = attributes.id;

      if (!id) {
        console.warn('Twitter embed directive without id attribute');
        return;
      }

      if (node.type === 'textDirective') {
        console.error(
          'Unexpected `:twitter` text directive, use two colons for a leaf directive',
          node
        );
        return;
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
        'data-conversation': 'none'
      };

      // Twitterの正しいURL
      const tweetUrl = `https://twitter.com/i/status/${id}`;

      // blockquoteの子要素として適切なコンテンツを設定
      node.children = [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Loading tweet...'
            }
          ]
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: '— '
            },
            {
              type: 'link',
              url: tweetUrl,
              children: [
                {
                  type: 'text',
                  value: `View on X`
                }
              ]
            }
          ]
        }
      ];
    });
  };
};
