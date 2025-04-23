import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

/**
 * ::twitter{id="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkTwitterEmbed: Plugin = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: any) => {
      if (node.name !== 'twitter') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const id = attributes.id;

      if (!id) {
        console.warn('Twitter embed directive without id attribute');
        return;
      }

      // HTMLノードに変換
      data.hName = 'div';
      data.hProperties = {
        className: ['twitter-embed'],
        style: 'display: flex; justify-content: center; margin: 1.5rem 0;'
      };

      // Twitter埋め込みコードを子要素として追加
      node.children = [{
        type: 'paragraph',
        data: {
          hName: 'blockquote',
          hProperties: {
            className: ['twitter-tweet'],
            'data-dnt': 'true'
          }
        },
        children: [{
          type: 'paragraph',
          data: {
            hName: 'a',
            hProperties: {
              href: `https://twitter.com/user/status/${id}`
            }
          },
          children: [{
            type: 'text',
            value: 'Loading tweet...'
          }]
        }]
      }];

      // Twitter埋め込みスクリプトを追加
      node.children.push({
        type: 'paragraph',
        data: {
          hName: 'script',
          hProperties: {
            async: true,
            src: 'https://platform.twitter.com/widgets.js',
            charset: 'utf-8'
          }
        },
        children: []
      });
    });
  };
};
