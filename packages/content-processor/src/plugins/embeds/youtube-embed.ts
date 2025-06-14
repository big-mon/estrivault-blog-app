import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/**
 * ::youtube{id="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkYoutubeEmbed: Plugin<[], Root, Root> = () => {
  return (tree) => {
    visit(tree, function (node) {
      const isTargetType =
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective';
      if (!isTargetType) return;
      if (node.name !== 'youtube') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const id = attributes.id;

      if (node.type === 'textDirective') {
        console.error(
          'Unexpected `:youtube` text directive, use two colons for a leaf directive',
          node
        );
        return;
      }

      if (!id) {
        console.error('Unexpected missing `id` on `youtube` directive', node);
        return;
      }

      // ラッパーdivの設定
      data.hName = 'div';
      data.hProperties = {
        className: ['youtube-embed'],
        style: 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1rem 0;'
      };

      // iframeの設定
      data.hChildren = [{
        type: 'element',
        tagName: 'iframe',
        properties: {
          src: 'https://www.youtube.com/embed/' + id,
          frameBorder: '0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowFullScreen: true,
          style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
        },
        children: []
      }];
    });
  };
};
