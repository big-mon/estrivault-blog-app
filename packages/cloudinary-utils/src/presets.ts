import { BuildUrlOptions } from './types';

/**
 * 画像のアスペクト比を維持したままリサイズするプリセット
 */
export const FIT_PRESETS = {
  /** 幅300pxにリサイズ（アスペクト比維持） */
  SMALL: { w: 300, mode: 'fit' as const },

  /** 幅600pxにリサイズ（アスペクト比維持） */
  MEDIUM: { w: 600, mode: 'fit' as const },

  /** 幅1200pxにリサイズ（アスペクト比維持） */
  LARGE: { w: 1200, mode: 'fit' as const },
} as const;

/**
 * 指定したサイズにトリミングするサムネイル用プリセット
 */
export const THUMBNAIL_PRESETS = {
  /** 正方形のサムネイル (150x150) */
  SQUARE: { w: 150, h: 150, mode: 'fill' as const },

  /** 横長のサムネイル (300x200) */
  LANDSCAPE: { w: 300, h: 200, mode: 'fill' as const },

  /** 縦長のサムネイル (200x300) */
  PORTRAIT: { w: 200, h: 300, mode: 'fill' as const },
} as const;

/**
 * ソーシャルメディア用の画像サイズプリセット
 */
export const SOCIAL_PRESETS = {
  /** Twitter シェア画像 (1200x630) */
  TWITTER: { w: 1200, h: 630, mode: 'fill' as const },

  /** Facebook シェア画像 (1200x630) */
  FACEBOOK: { w: 1200, h: 630, mode: 'fill' as const },

  /** Instagram 投稿画像 (1080x1080) */
  INSTAGRAM: { w: 1080, h: 1080, mode: 'fill' as const },
} as const;

/**
 * すべてのプリセットをまとめたオブジェクト
 */
export const IMAGE_PRESETS = {
  fit: FIT_PRESETS,
  thumbnail: THUMBNAIL_PRESETS,
  social: SOCIAL_PRESETS,
} as const;

/**
 * プリセットの型定義
 */
export type ImagePreset = BuildUrlOptions;
export type ImagePresetKey =
  | keyof typeof THUMBNAIL_PRESETS
  | keyof typeof FIT_PRESETS
  | keyof typeof SOCIAL_PRESETS;
