import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/**
 * ::youtube{id="..."} ディレクティブをHTML要素に変換するremarkプラグイン
 */
export const remarkYoutubeEmbed: Plugin<[], Root, Root> = () => {
  return (tree: Root) => {
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
        className: 'youtube-embed',
        style:
          'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1rem 0;',
      };

      // iframeのHTMLを直接生成して設定
      const iframeHtml = `
        <iframe
          src="https://www.youtube.com/embed/${id}"
          width="100%"
          height="100%"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        ></iframe>
      `;

      // ノードのタイプをHTMLに変更
      node.type = 'html';
      node.value = iframeHtml;
    });
  };
};
