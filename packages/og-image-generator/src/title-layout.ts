import { createElement as h } from 'react';
import satori, { type SatoriOptions } from 'satori';

// Card width minus the outer padding, card border, and inner padding.
export const POST_OGP_TITLE_WIDTH = 1200 - 2 * (42 + 1 + 46);
const MAX_LINES = 3;
const FONT_SIZES = [76, 64, 56];

export function getPostOgpTitleStyle(fontSize: number, clamp = true) {
  return {
    display: 'block' as const,
    width: POST_OGP_TITLE_WIDTH,
    fontFamily: 'Noto Sans JP',
    fontSize,
    fontWeight: 700,
    lineHeight: 1.14,
    letterSpacing: '-0.05em',
    wordBreak: 'break-word' as const,
    ...(clamp ? { lineClamp: MAX_LINES } : {}),
    color: '#303e32',
  };
}

export async function layoutPostOgpTitle(title: string, fonts: SatoriOptions['fonts']) {
  const normalizedTitle = title.replace(/\s+/g, ' ').trim();
  for (const fontSize of FONT_SIZES) {
    const style = getPostOgpTitleStyle(fontSize);
    let height = 0;
    await satori(
      h('div', { lang: 'ja-JP', style: getPostOgpTitleStyle(fontSize, false) }, normalizedTitle),
      {
        width: POST_OGP_TITLE_WIDTH,
        fonts,
        embedFont: false,
        onNodeDetected: (node) => {
          height = node.height;
        },
      },
    );
    const truncated = height > MAX_LINES * Math.ceil(fontSize * style.lineHeight);
    if (!truncated || fontSize === FONT_SIZES.at(-1)) {
      return { title: normalizedTitle, fontSize, truncated };
    }
  }
  throw new Error('No OGP title font size configured');
}
