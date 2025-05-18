import { FIT_PRESETS, THUMBNAIL_PRESETS, SOCIAL_PRESETS } from './presets';

/**
 * buildUrl 関数のオプション型
 */
export interface BuildUrlOptions {
  /** 画像の幅（ピクセル） */
  w: number;

  /** 画像の高さ（ピクセル、省略可能） */
  h?: number;

  /** リサイズモード: 'fill'（トリミング）または 'fit'（アスペクト比維持） */
  mode?: 'fill' | 'fit';
}

/**
 * プリセットの型定義
 */
export type ImagePreset = BuildUrlOptions;

/**
 * プリセットのキー型
 */
export type ImagePresetKey =
  | keyof typeof THUMBNAIL_PRESETS
  | keyof typeof FIT_PRESETS
  | keyof typeof SOCIAL_PRESETS;

/**
 * プリセットのカテゴリ
 */
export type PresetCategory = 'thumbnail' | 'fit' | 'social';

/**
 * プリセットのコレクション
 */
export interface ImagePresets {
  [key: string]: ImagePreset;
}
