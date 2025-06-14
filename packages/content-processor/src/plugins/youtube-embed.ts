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

      data.hName = 'iframe';
      data.hProperties = {
        src: 'https://www.youtube.com/embed/' + id,
        width: 200,
        height: 200,
        frameBorder: 0,
        allow: 'picture-in-picture',
        allowFullScreen: true,
      };
    });
  };
};
