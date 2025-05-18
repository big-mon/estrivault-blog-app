import { Cloudinary } from '@cloudinary/url-gen';
import { fill, fit } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';

export * from './presets';

export type {
  BuildUrlOptions,
  ImagePreset,
  ImagePresetKey,
  PresetCategory,
  ImagePresets,
} from './types';

/**
 * Cloudinary 画像 URL を生成します。
 *
 * @example
 * // 基本の使用例（幅のみ指定、アスペクト比を維持）
 * const url = buildUrl('your-cloud', 'sample.jpg', { w: 800 });
 *
 * @example
 * // 幅と高さを指定してトリミング
 * const url = buildUrl('your-cloud', 'sample.jpg', {
 *   w: 800,
 *   h: 600,
 *   mode: 'fill'
 * });
 *
 * @param cloudName Cloudinary のクラウド名
 * @param publicId 画像の公開ID（パスを含む）
 * @param opts 画像変換オプション
 * @param opts.w 画像の幅（ピクセル、1以上の整数）
 * @param [opts.h] 画像の高さ（ピクセル、1以上の整数、省略可能）
 * @param [opts.mode='fill'] リサイズモード: 'fill'（トリミング）または 'fit'（アスペクト比維持）
 * @returns 生成された画像URL
 * @throws {Error} 無効なパラメータが指定された場合
 */
export function buildUrl(
  cloudName: string,
  publicId: string,
  opts: {
    w: number;
    h?: number;
    mode?: 'fill' | 'fit';
  }
): string {
  // 入力値の検証
  if (typeof cloudName !== 'string' || !cloudName.trim()) {
    throw new Error('cloudName must be a non-empty string');
  }

  if (typeof publicId !== 'string' || !publicId.trim()) {
    throw new Error('publicId must be a non-empty string');
  }

  if (typeof opts !== 'object' || opts === null) {
    throw new Error('opts must be an object');
  }

  if (typeof opts.w !== 'number' || !Number.isInteger(opts.w) || opts.w < 1) {
    throw new Error('opts.w must be a positive integer');
  }

  if (opts.h !== undefined) {
    if (typeof opts.h !== 'number' || !Number.isInteger(opts.h) || opts.h < 1) {
      throw new Error('opts.h must be a positive integer if provided');
    }

    if (opts.mode !== 'fit' && opts.h === undefined) {
      throw new Error('opts.h is required when mode is not "fit"');
    }
  }

  if (opts.mode !== undefined && opts.mode !== 'fill' && opts.mode !== 'fit') {
    throw new Error('opts.mode must be either "fill" or "fit"');
  }

  // Cloudinary URL の生成
  const cld = new Cloudinary({ cloud: { cloudName } });
  const img = cld.image(publicId);

  try {
    // リサイズ処理
    if (opts.mode === 'fit' || !opts.h) {
      img.resize(fit().width(opts.w));
    } else {
      img.resize(fill().width(opts.w).height(opts.h));
    }

    // フォーマットと品質の最適化
    img.delivery(format('auto')).delivery(quality('auto'));

    return img.toURL();
  } catch (error) {
    // Cloudinary のエラーをラップしてスロー
    throw new Error(
      `Failed to generate Cloudinary URL: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
