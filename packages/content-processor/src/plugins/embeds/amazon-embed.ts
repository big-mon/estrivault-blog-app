import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

interface AmazonAttributes {
  asin: string;
  name?: string;
  [key: string]: string | undefined;
}

/**
 * ::amazon{asin="..." name="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 * スタイリングは呼び出し元のCSSクラスで制御します
 */
export const remarkAmazonEmbed: Plugin<[], Root, Root> = () => {
  return (tree) => {
    visit(tree, function (node) {
      const isTargetType =
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective';

      if (!isTargetType || node.name !== 'amazon') return;

      const data = node.data || (node.data = {});
      const attributes = (node.attributes as AmazonAttributes) || {};
      const asin = attributes.asin;
      const name = attributes.name;

      if (!asin) {
        console.error('Unexpected missing `asin` on `amazon` directive', node);
        return;
      }

      const affiliateId = 'd6l0g03-22';
      const link = `https://www.amazon.co.jp/gp/product/${asin}?tag=${affiliateId}`;
      const imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.MZZZZZZZ`;
      const title = name || '商品の詳細を見る';

      if (node.type === 'textDirective') {
        console.error(
          'Unexpected `:amazon` text directive, use two colons for a leaf directive',
          node,
        );
        return;
      }

      // 商品カードの構造を構築
      data.hName = 'div';
      data.hProperties = {
        className: 'amazon-embed',
        'data-amazon-asin': asin,
        'data-component-name': 'AmazonEmbed',
      };

      data.hChildren = [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['amazon-card'],
          },
          children: [
            // 商品画像部分
            {
              type: 'element',
              tagName: 'a',
              properties: {
                href: link,
                rel: 'noopener noreferrer',
                target: '_blank',
                className: ['amazon-card__image'],
              },
              children: [
                {
                  type: 'element',
                  tagName: 'img',
                  properties: {
                    src: imageUrl,
                    alt: title,
                    loading: 'lazy',
                    className: ['amazon-card__image__img'],
                  },
                  children: [],
                },
              ],
            },
            // 商品情報部分
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['amazon-card__content'],
              },
              children: [
                {
                  type: 'element',
                  tagName: 'a',
                  properties: {
                    href: link,
                    rel: 'noopener noreferrer',
                    target: '_blank',
                    className: ['amazon-card__title'],
                  },
                  children: [
                    {
                      type: 'text',
                      value: title,
                    },
                  ],
                },
                {
                  type: 'element',
                  tagName: 'a',
                  properties: {
                    href: link,
                    rel: 'noopener noreferrer',
                    target: '_blank',
                    className: ['amazon-card__cta'],
                  },
                  children: [
                    {
                      type: 'text',
                      value: 'Amazonで見る',
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
