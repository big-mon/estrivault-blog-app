import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/**
 * ::amazon{asin="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkAmazonEmbed: Plugin<[], Root, Root> = () => {
  return (tree) => {
    visit(tree, function (node) {
        const isTargetType =
          node.type === 'containerDirective' ||
          node.type === 'leafDirective' ||
          node.type === 'textDirective';
        if (!isTargetType) return;
        if (node.name !== 'amazon') return;

        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};
        const asin = attributes.asin;
        const name = attributes.name;
        const affiliateId = 'estrivault-24';
        const link = `https://www.amazon.co.jp/gp/product/${asin}?tag=${affiliateId}`;
        const imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.MZZZZZZZ`;

        if (node.type === 'textDirective') {
            console.error(
                'Unexpected `:amazon` text directive, use two colons for a leaf directive',
                node
            );
            return;
        }

        if (!asin) {
            console.error('Unexpected missing `asin` on `amazon` directive', node);
            return;
        }

        // ラッパーdivの設定
        data.hName = 'div';
        data.hProperties = {
            className: ['amazon-embed'],
            style: 'margin: 1.5rem 0; border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px;',
        };

        // Amazon商品リンクを子要素として追加
        data.hChildren = [
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['grid', 'grid-cols-10', 'gap-6', 'border-neutral/20', 'my-8', 'border', 'px-2', 'py-4']
              },
              children: [
                // 商品画像部分
                {
                  type: 'element',
                  tagName: 'a',
                  properties: {
                    href: `https://www.amazon.co.jp/dp/${asin}`,
                    rel: 'noreferrer noopener external nofollow',
                    target: '_blank',
                    className: ['col-span-3']
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'img',
                      properties: {
                        src: imageUrl,
                        alt: name || `Amazon商品 (ASIN: ${asin})`,
                        className: ['mx-auto']
                      },
                      children: []
                    }
                  ]
                },
                // 商品情報部分
                {
                  type: 'element',
                  tagName: 'div',
                  properties: {
                    className: ['col-span-7']
                  },
                  children: [
                    // 商品タイトル
                    {
                      type: 'element',
                      tagName: 'a',
                      properties: {
                        href: link,
                        rel: 'noreferrer noopener external nofollow',
                        target: '_blank',
                        className: ['hover:text-tertiary', 'text-primary', 'font-semibold', 'break-words', 'mb-4', 'inline-block']
                      },
                      children: [
                        {
                          type: 'text',
                          value: name || `Amazon商品 (ASIN: ${asin})`
                        }
                      ]
                    },
                    // Amazonで見るボタン
                    {
                      type: 'element',
                      tagName: 'a',
                      properties: {
                        href: link,
                        rel: 'noreferrer noopener external nofollow',
                        target: '_blank'
                      },
                      children: [
                        {
                          type: 'element',
                          tagName: 'button',
                          properties: {
                            className: ['block', 'rounded-md', 'bg-amber-400', 'duration-300', 'hover:bg-amber-500', 'cursor-pointer', 'px-3', 'py-2', 'text-center', 'text-xs', 'font-medium']
                          },
                          children: [
                            {
                              type: 'text',
                              value: 'Amazonで見る'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
    });
  };
};
