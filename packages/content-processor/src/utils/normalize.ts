/**
 * タグフィルタリング用正規化関数
 * 日本語文字を保持し、大文字小文字とスペースのみを正規化
 */
export function normalizeForTagFilter(str: string): string {
  return (
    str
      .trim()
      .toLowerCase()
      // 全角英数字→半角
      .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      // 連続スペースを1つに
      .replace(/\s+/g, ' ')
  );
}

/**
 * URLスラッグ用正規化関数
 * URLセーフな文字列に変換（英数字とハイフンのみ）
 */
export function normalizeForSlug(str: string): string {
  return (
    str
      .trim()
      .toLowerCase()
      // 全角英数字→半角
      .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      // 空白・アンダースコア→ハイフン
      .replace(/[\s_]+/g, '-')
      // 英数字・ハイフン以外除去
      .replace(/[^a-z0-9-]/g, '')
      // 連続ハイフンを1つに
      .replace(/-+/g, '-')
      // 先頭・末尾ハイフン除去
      .replace(/^-+|-+$/g, '')
  );
}
