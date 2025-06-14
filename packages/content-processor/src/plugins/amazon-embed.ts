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
        data.hChildren = [{
            type: 'element',
            tagName: 'div',
            properties: {
                className: ['amazon-embed'],
                style: 'margin: 1.5rem 0; border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px;',
            },
            children: [
                {
                    type: 'element',
                    tagName: 'iframe',
                    properties: {
                        src: 'https://www.amazon.co.jp/dp/' + asin,
                        frameBorder: '0',
                        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                        allowFullScreen: true,
                        style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
                    },
                    children: []
                }
            ]
        }]
    });
  };
};
