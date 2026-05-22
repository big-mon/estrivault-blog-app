export interface TitleLayout {
  fontSize: number;
  lineHeight: number;
  lines: string[];
  truncated: boolean;
}

interface TitlePreset {
  fontSize: number;
  lineHeight: number;
  maxCharsPerLine: number;
  maxLines: number;
}

const TITLE_PRESETS: TitlePreset[] = [
  { fontSize: 76, lineHeight: 1.14, maxCharsPerLine: 12, maxLines: 3 },
  { fontSize: 64, lineHeight: 1.16, maxCharsPerLine: 14, maxLines: 3 },
  { fontSize: 56, lineHeight: 1.2, maxCharsPerLine: 17, maxLines: 3 },
];

function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

function truncateTitle(
  characters: string[],
  maxCharacters: number,
): { value: string; truncated: boolean } {
  if (characters.length <= maxCharacters) {
    return { value: characters.join(''), truncated: false };
  }

  return {
    value: `${characters.slice(0, Math.max(maxCharacters - 1, 1)).join('')}…`,
    truncated: true,
  };
}

const PROHIBITED_LINE_START_CHARACTERS = new Set(
  Array.from('、。，．・：；！？!?)]）｝」』】〉》ぁぃぅぇぉっゃゅょー…'),
);
const PROHIBITED_LINE_END_CHARACTERS = new Set(Array.from('([{（｛「『【〈《'));

function adjustLineLength(
  characters: string[],
  start: number,
  lineLength: number,
  minLineLength: number,
  maxLineLength: number,
): number {
  let adjustedLength = lineLength;

  while (
    adjustedLength > minLineLength &&
    PROHIBITED_LINE_START_CHARACTERS.has(characters[start + adjustedLength] ?? '')
  ) {
    adjustedLength -= 1;
  }

  while (
    adjustedLength > minLineLength &&
    PROHIBITED_LINE_END_CHARACTERS.has(characters[start + adjustedLength - 1] ?? '')
  ) {
    adjustedLength -= 1;
  }

  if (
    adjustedLength < maxLineLength &&
    PROHIBITED_LINE_START_CHARACTERS.has(characters[start + adjustedLength] ?? '')
  ) {
    adjustedLength += 1;
  }

  return adjustedLength;
}

function wrapTitle(title: string, maxCharsPerLine: number, maxLines: number): string[] {
  const characters = Array.from(title);
  const lines: string[] = [];
  const lineCount = Math.min(Math.ceil(characters.length / maxCharsPerLine), maxLines);
  let index = 0;

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
    const remainingCharacters = characters.length - index;
    const remainingLines = lineCount - lineIndex;
    const minLineLength = Math.max(1, remainingCharacters - maxCharsPerLine * (remainingLines - 1));
    const lineLength = adjustLineLength(
      characters,
      index,
      Math.min(Math.ceil(remainingCharacters / remainingLines), maxCharsPerLine),
      minLineLength,
      Math.min(maxCharsPerLine + 1, remainingCharacters),
    );

    lines.push(characters.slice(index, index + lineLength).join(''));
    index += lineLength;
  }

  return lines;
}

export function layoutPostOgpTitle(title: string): TitleLayout {
  const normalizedTitle = normalizeTitle(title);
  const titleLength = Array.from(normalizedTitle).length;
  const preset =
    TITLE_PRESETS[
      titleLength <= 24 ? 0
      : titleLength <= 42 ? 1
      : 2
    ]!;
  const maxCharacters = preset.maxCharsPerLine * preset.maxLines;
  const { value, truncated } = truncateTitle(Array.from(normalizedTitle), maxCharacters);

  return {
    fontSize: preset.fontSize,
    lineHeight: preset.lineHeight,
    lines: wrapTitle(value, preset.maxCharsPerLine, preset.maxLines),
    truncated,
  };
}
