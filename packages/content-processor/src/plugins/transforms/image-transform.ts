import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'hast';
import { buildUrl, buildSrcSet, type BuildUrlOptions } from '@estrivault/cloudinary-utils';

export interface ImageTransformOptions {
  /** Cloudinaryクラウド名（必須） */
  cloudinaryCloudName: string;
}

/**
 * 本文画像のURLをCloudinary CDN URLへ解決する。
 *
 * ネットワークパス参照とscheme付きURIは入力をそのまま返し、それ以外は既存の
 * HTML変換と同じpublic IDおよび変換条件を使う。変換対象なのにクラウド名がない
 * 場合は、壊れた相対パスを公開しないよう明示的に失敗させる。
 */
export function resolveBodyImageUrl(
  src: string,
  cloudinaryCloudName: string | undefined,
  mode: 'fill' | 'fit' = 'fit',
): string {
  if (isExternalBodyImageUrl(src)) {
    return src;
  }

  const publicId = getBodyImagePublicId(src);
  if (!publicId) {
    return src;
  }

  const normalizedCloudinaryCloudName = cloudinaryCloudName?.trim();
  if (!normalizedCloudinaryCloudName) {
    throw new Error('cloudinaryCloudName is required for body image transformation');
  }

  return buildUrl(normalizedCloudinaryCloudName, publicId, {
    w: 1200,
    mode,
    quality: 90,
  });
}

function getBodyImagePublicId(src: string): string {
  const path = src.split(/[?#]/, 1)[0] ?? '';
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path.replace(/^\.\//, '');

  if (normalizedPath.split('/').includes('..')) {
    throw new Error(
      `Body image source ${JSON.stringify(src)} cannot use parent-relative path segments`,
    );
  }

  const filenameStart = normalizedPath.lastIndexOf('/') + 1;
  const extensionStart = normalizedPath.lastIndexOf('.');
  const hasExtension = extensionStart > filenameStart && extensionStart < normalizedPath.length - 1;

  return hasExtension ? normalizedPath.slice(0, extensionStart) : normalizedPath;
}

const EXTERNAL_BODY_IMAGE_URL_PATTERN = /^(?:\/\/|[A-Za-z][A-Za-z0-9+.-]*:)/i;

function isExternalBodyImageUrl(src: string): boolean {
  return EXTERNAL_BODY_IMAGE_URL_PATTERN.test(src);
}

/**
 * 画像パスをCloudinary CDN URLに変換するrehypeプラグイン
 */
export const rehypeImageTransform: Plugin<[ImageTransformOptions?], Root, Root> = (options) => {
  const { cloudinaryCloudName } = options || {};

  if (!cloudinaryCloudName?.trim()) {
    throw new Error('cloudinaryCloudName is required for rehypeImageTransform');
  }

  const normalizedCloudinaryCloudName = cloudinaryCloudName.trim();

  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'img' || !node.properties || !parent || index === undefined) {
        return undefined;
      }

      const src = node.properties.src;
      const title = node.properties.title;

      if (typeof src !== 'string' || !src) {
        return undefined;
      }

      const mode =
        (node.properties['data-mode'] as string) === 'fill' ? ('fill' as const) : ('fit' as const);
      const resolvedSrc = resolveBodyImageUrl(src, normalizedCloudinaryCloudName, mode);
      if (resolvedSrc === src) {
        return undefined;
      }

      const publicId = getBodyImagePublicId(src);
      const buildOptions: BuildUrlOptions = { w: 1200, mode, quality: 90 };
      node.properties.src = resolvedSrc;
      node.properties.srcset = buildSrcSet(normalizedCloudinaryCloudName, publicId, buildOptions);
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';

      if (!node.properties.sizes) {
        node.properties.sizes = '(max-width: 640px) 100vw, (max-width: 768px) 90vw, 800px';
      }

      const figureChildren = [node];
      if (title && typeof title === 'string') {
        const figcaption = {
          type: 'element' as const,
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text' as const, value: title }],
        };
        figureChildren.push(figcaption);
        delete node.properties.title;
      }

      const figure = {
        type: 'element' as const,
        tagName: 'figure',
        properties: {},
        children: figureChildren,
      };

      if (Array.isArray(parent.children)) {
        parent.children[index] = figure;
      }
      return undefined;
    });

    return tree;
  };
};
