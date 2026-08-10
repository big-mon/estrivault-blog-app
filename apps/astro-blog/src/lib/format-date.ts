const editorialDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatEditorialDate(date: Date): string {
  return editorialDateFormatter.format(date).replace(/\//g, '.');
}
