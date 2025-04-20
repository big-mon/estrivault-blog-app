import { visit } from 'unist-util-visit';

export default function remarkCloudinaryImages() {
  return (tree) => {
    visit(tree, 'image', (node, i, parent) => {
      const url = node.url ?? '';
      const isExternal = /^https?:\/\//i.test(url);   // http/https が付いてたら外部
      if (isExternal) return;                         // そのまま <img>

      // ===== Cloudinary 変換 =====
      parent.children[i] = {
        type: 'mdxJsxFlowElement',
        name: 'CldImage',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'publicId', value: url },
          { type: 'mdxJsxAttribute', name: 'alt',      value: node.alt || '' },
          { type: 'mdxJsxAttribute', name: 'width',    value: '800' },
          { type: 'mdxJsxAttribute', name: 'height',   value: '450' },
        ],
        children: [],
      };
    });
  };
}
