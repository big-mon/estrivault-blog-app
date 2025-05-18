/**
 * 日付文字列をフォーマットする
 * @param dateString ISO 8601形式の日付文字列
 * @returns フォーマットされた日付文字列（例: 2025年4月23日）
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // 日本語フォーマット
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * 相対的な時間表現を返す
 * @param dateString ISO 8601形式の日付文字列
 * @returns 相対的な時間表現（例: 3日前、1時間前）
 */
export function getRelativeTimeString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSecs < 60) {
    return '数秒前';
  } else if (diffInMins < 60) {
    return `${diffInMins}分前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  } else if (diffInDays < 30) {
    return `${diffInDays}日前`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}ヶ月前`;
  } else {
    return `${diffInYears}年前`;
  }
}
