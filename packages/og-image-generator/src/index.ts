import { Resvg } from '@resvg/resvg-js';
import { createElement as h } from 'react';
import satori from 'satori';
import { loadPostOgpFonts } from './font';
import { layoutPostOgpTitle } from './title-layout';

export interface PostOgpCardData {
  title: string;
  category: string;
  publishedAt: Date | string;
  slug: string;
  siteTitle: string;
  siteUrl: string;
}

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;

function renderTitleLines(lines: string[], fontSize: number, lineHeight: number) {
  return lines.map((line, index) =>
    h(
      'div',
      {
        key: `title-line-${index}`,
        style: {
          display: 'flex',
          fontSize,
          lineHeight,
          fontWeight: 700,
          letterSpacing: '-0.05em',
          color: '#050505',
        },
      },
      line,
    ),
  );
}

export async function generatePostOgpPng(input: PostOgpCardData): Promise<Uint8Array> {
  const titleLayout = layoutPostOgpTitle(input.title);
  const category = input.category || 'Other';

  const markup = h(
    'div',
    {
      style: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f6f6f3',
        color: '#050505',
        fontFamily: 'Noto Sans JP',
      },
    },
    h('div', {
      style: {
        position: 'absolute',
        top: 0,
        right: 84,
        width: 240,
        height: 12,
        backgroundColor: '#050505',
      },
    }),
    h('div', {
      style: {
        position: 'absolute',
        top: 68,
        right: 84,
        width: 148,
        height: 148,
        border: '3px solid rgba(5,5,5,0.14)',
      },
    }),
    h('div', {
      style: {
        position: 'absolute',
        bottom: 46,
        left: 46,
        width: 260,
        height: 72,
        borderLeft: '14px solid #050505',
        borderBottom: '14px solid #050505',
        opacity: 0.92,
      },
    }),
    h(
      'div',
      {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 42,
        },
      },
      h(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '3px solid #050505',
            backgroundColor: 'rgba(255,255,255,0.96)',
            padding: '34px 36px 32px 36px',
            boxShadow: '18px 18px 0 rgba(5,5,5,0.08)',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                padding: '12px 18px',
                backgroundColor: '#050505',
                color: '#ffffff',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              },
            },
            category,
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                border: '2px solid #050505',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              },
            },
            'Article',
          ),
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'stretch',
              gap: 28,
              marginTop: 18,
              marginBottom: 24,
            },
          },
          h('div', {
            style: {
              display: 'flex',
              width: 16,
              flexShrink: 0,
              backgroundColor: '#050505',
            },
          }),
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxWidth: 930,
                paddingTop: 4,
              },
            },
            h('div', {
              style: {
                display: 'flex',
                width: 220,
                height: 4,
                backgroundColor: '#050505',
              },
            }),
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                },
              },
              ...renderTitleLines(titleLayout.lines, titleLayout.fontSize, titleLayout.lineHeight),
            ),
          ),
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              gap: 24,
              borderTop: '2px solid #050505',
              paddingTop: 24,
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 10,
              },
            },
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#505050',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                },
              },
              'Estrilda',
            ),
            h('div', {
              style: {
                display: 'flex',
                width: 180,
                height: 14,
                backgroundColor: '#050505',
              },
            }),
          ),
        ),
      ),
    ),
  );

  const svg = await satori(markup, {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    fonts: await loadPostOgpFonts(),
  });
  const rendered = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: IMAGE_WIDTH,
    },
  }).render();

  return rendered.asPng();
}

export { layoutPostOgpTitle };
