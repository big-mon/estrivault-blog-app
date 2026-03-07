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
  { fontSize: 64, lineHeight: 1.16, maxCharsPerLine: 16, maxLines: 3 },
  { fontSize: 56, lineHeight: 1.2, maxCharsPerLine: 20, maxLines: 3 },
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

function wrapTitle(title: string, maxCharsPerLine: number): string[] {
  const characters = Array.from(title);
  const lines: string[] = [];

  for (let index = 0; index < characters.length; index += maxCharsPerLine) {
    lines.push(characters.slice(index, index + maxCharsPerLine).join(''));
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
    lines: wrapTitle(value, preset.maxCharsPerLine),
    truncated,
  };
}
