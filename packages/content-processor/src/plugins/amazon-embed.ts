import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

/**
 * ::amazon{asin="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkAmazonEmbed: Plugin = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: any) => {
      if (node.name !== 'amazon') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const { asin } = attributes;

      if (!asin) {
        console.warn('Amazon embed directive missing asin attribute');
        return;
      }

      // HTMLノードに変換
      data.hName = 'div';
      data.hProperties = {
        className: ['amazon-embed'],
        style: 'margin: 1.5rem 0; border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px;',
      };

      // Amazon商品リンクを子要素として追加
      node.children = [
        {
          type: 'paragraph',
          data: {
            hName: 'a',
            hProperties: {
              href: `https://www.amazon.co.jp/dp/${asin}`,
              target: '_blank',
              rel: 'noopener noreferrer sponsored',
              className: ['amazon-link'],
              style: 'display: flex; text-decoration: none; color: inherit;',
            },
          },
          children: [
            {
              type: 'paragraph',
              data: {
                hName: 'div',
                hProperties: {
                  className: ['amazon-image'],
                  style: 'margin-right: 16px; min-width: 120px;',
                },
              },
              children: [
                {
                  type: 'paragraph',
                  data: {
                    hName: 'img',
                    hProperties: {
                      src: `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.MZZZZZZZ`,
                      alt: 'Amazon商品画像',
                      style: 'max-width: 120px; max-height: 120px;',
                    },
                  },
                  children: [],
                },
              ],
            },
            {
              type: 'paragraph',
              data: {
                hName: 'div',
                hProperties: {
                  className: ['amazon-info'],
                  style: 'flex: 1;',
                },
              },
              children: [
                {
                  type: 'paragraph',
                  data: {
                    hName: 'div',
                    hProperties: {
                      className: ['amazon-title'],
                      style: 'font-weight: bold; margin-bottom: 8px;',
                    },
                  },
                  children: [
                    {
                      type: 'text',
                      value: 'Amazon商品を見る',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
    });
  };
};
