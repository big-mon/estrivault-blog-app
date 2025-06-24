import { Cloudinary } from '@cloudinary/url-gen';
import { fill, fit } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';

export interface BuildUrlOptions {
  w: number;
  h?: number;
  mode?: 'fill' | 'fit';
}

/**
 * 基本的な画像サイズプリセット
 */
export const IMAGE_PRESETS = {
  thumbnail: { w: 150, h: 150, mode: 'fill' as const },
  small: { w: 300, mode: 'fit' as const },
  medium: { w: 600, mode: 'fit' as const },
  large: { w: 1200, mode: 'fit' as const },
  social: { w: 1200, h: 630, mode: 'fill' as const },
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

  img.delivery(format('auto')).delivery(quality('auto'));
  return img.toURL();
}
