import { Cloudinary } from '@cloudinary/url-gen';
import { fill, fit } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';

export interface BuildUrlOptions {
  w: number;
  h?: number;
  mode?: 'fill' | 'fit';
  quality?: number | 'auto' | 'best' | 'good' | 'eco' | 'low';
}

/**
 * 基本的な画像サイズ・品質プリセット
 */
export const IMAGE_PRESETS = {
  thumbnail: { w: 150, h: 150, mode: 'fill' as const, quality: 'good' as const },
  small: { w: 300, mode: 'fit' as const, quality: 'good' as const },
  medium: { w: 600, mode: 'fit' as const, quality: 'best' as const },
  large: { w: 1200, mode: 'fit' as const, quality: 'best' as const },
  xlarge: { w: 1800, mode: 'fit' as const, quality: 'best' as const },
  social: { w: 1200, h: 630, mode: 'fill' as const, quality: 'good' as const },

  // 記事専用プリセット
  blogContent: { w: 1600, mode: 'fit' as const, quality: 'best' as const },
  blogCover: { w: 1200, mode: 'fit' as const, quality: 'best' as const },
  blogThumbnail: { w: 400, mode: 'fit' as const, quality: 'good' as const },
} as const;

/**
 * Cloudinary画像URLを生成
 */
export function buildUrl(cloudName: string, publicId: string, opts: BuildUrlOptions): string {
  if (!cloudName || !publicId || !opts?.w) {
    throw new Error('Invalid parameters');
  }

  const cld = new Cloudinary({ cloud: { cloudName } });
  const img = cld.image(publicId);

  if (opts.mode === 'fit' || !opts.h) {
    img.resize(fit().width(opts.w));
  } else {
    img.resize(fill().width(opts.w).height(opts.h));
  }

  // 品質設定の適用
  const imageQuality = opts.quality || 'auto';
  img.delivery(format('auto')).delivery(quality(imageQuality));

  return img.toURL();
}

/**
 * レスポンシブ画像用のsrcsetを生成
 */
export function buildSrcSet(
  cloudName: string,
  publicId: string,
  baseOpts: BuildUrlOptions,
): string {
  // 記事コンテンツ幅に適したサイズ（最大800px表示 + 高解像度対応）
  const widths = [400, 600, 800, 1200];
  const baseWidth = baseOpts.w;

  // ベース幅以下のサイズのみを生成
  const validWidths = widths.filter((w) => w <= baseWidth);
  if (!validWidths.includes(baseWidth)) {
    validWidths.push(baseWidth);
  }

  return validWidths
    .sort((a, b) => a - b)
    .map((w) => {
      const opts = { ...baseOpts, w };
      return `${buildUrl(cloudName, publicId, opts)} ${w}w`;
    })
    .join(', ');
}
