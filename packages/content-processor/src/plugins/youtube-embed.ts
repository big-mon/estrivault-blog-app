import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Paragraph } from 'mdast';

/**
 * ::youtube{id="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkYoutubeEmbed: Plugin = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: any) => {
      if (node.name !== 'youtube') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const id = attributes.id;

      if (!id) {
        console.warn('YouTube embed directive without id attribute');
        return;
      }

      // HTMLノードに変換
      data.hName = 'div';
      data.hProperties = {
        className: ['youtube-embed'],
        style: 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;'
      };

      // iframeを子要素として追加
      node.children = [{
        type: 'paragraph',
        data: {
          hName: 'iframe',
          hProperties: {
            src: `https://www.youtube.com/embed/${id}`,
            frameBorder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
            style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
          }
        },
        children: []
      }];
    });
  };
};
