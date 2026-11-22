export interface BuildUrlOptions {
  w: number;
  h?: number;
  mode?: 'fill' | 'fit';
  quality?: number | 'auto' | 'eco' | 'low';
}

/**
 * Cloudinary画像URLを生成
 *
 * 本文・カバー画像の変換は named 変換 `t_body`（c_limit,w_1200,f_auto,q_auto）に
 * 統一している。DAMONGE本文と同じ変換で、仕様はCloudinary側の定義だけが持つ。
 * そのため opts の w / mode / quality はURLに影響しない（呼び出し側の互換のため残す）。
 */
export function buildUrl(cloudName: string, publicId: string, opts: BuildUrlOptions): string {
  if (!cloudName || !publicId || !opts?.w) {
    throw new Error('Invalid parameters');
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/t_body/${publicId}`;
}

/**
 * srcset用URLを返す
 *
 * 本文画像は t_body の単一配信に統一したため、幅のバリエーションは作らない。
 * 呼び出し側の互換のため、単一URL（記述子なし）をそのまま返す。
 */
export function buildSrcSet(
  cloudName: string,
  publicId: string,
  baseOpts: BuildUrlOptions,
): string {
  return buildUrl(cloudName, publicId, baseOpts);
}
