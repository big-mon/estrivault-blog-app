const editorialDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatEditorialDate(date: Date): string {
  return editorialDateFormatter.format(date).replace(/\//g, '.');
}

const schemaDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function formatSchemaDate(date: Date): string {
  return `${schemaDateFormatter.format(date).replace(' ', 'T')}+09:00`;
}
