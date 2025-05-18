import { visit } from 'unist-util-visit';
import { buildUrl } from '@estrivault/cloudinary-utils';

const widths = [480, 768, 1024, 1200];
const aspectRatio = 16 / 9; // 必要に応じて別途指定可能
const mode = 'fill'; // or "fit"

function buildSrcSet(cloudName: string, publicId: string) {
  return widths
    .map((w) => {
      const h = aspectRatio && mode === 'fill' ? Math.round(w / aspectRatio) : undefined;
      const url = buildUrl(cloudName, publicId, { w, h, mode });
      return `${url} ${w}w`;
    })
    .join(', ');
}

export default function remarkCloudinaryImages() {
  return (tree) => {
    const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('Missing PUBLIC_CLOUDINARY_CLOUD_NAME');

    visit(tree, 'image', (node, i, parent) => {
      const url = node.url ?? '';
      const alt = node.alt ?? '';

      const isExternal = /^https?:\/\//i.test(url);
      if (isExternal) return;

      const fallbackWidth = Math.max(...widths);
      const fallbackHeight =
        aspectRatio && mode === 'fill' ? Math.round(fallbackWidth / aspectRatio) : undefined;

      const src = buildUrl(cloudName, url, { w: fallbackWidth, h: fallbackHeight, mode });
      const srcset = buildSrcSet(cloudName, url);

      const replacement = {
        type: 'html',
        value: `
          <img
            src="${src}"
            srcset="${srcset}"
            sizes="100vw"
            width="${fallbackWidth}"
            ${fallbackHeight ? `height="${fallbackHeight}"` : ''}
            alt="${alt}"
            loading="lazy"
          />
        `.trim(),
      };

      parent.children[i] = replacement;
    });
  };
}
