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

function getSiteHost(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname.replace(/^www\./, '');
  } catch {
    return siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

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
          letterSpacing: '-0.04em',
          color: '#0f172a',
        },
      },
      line,
    ),
  );
}

export async function generatePostOgpPng(input: PostOgpCardData): Promise<Uint8Array> {
  const titleLayout = layoutPostOgpTitle(input.title);
  const category = input.category || 'Other';
  const siteTitle = input.siteTitle;
  const siteHost = getSiteHost(input.siteUrl);

  const markup = h(
    'div',
    {
      style: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f5f1e8',
        color: '#0f172a',
        fontFamily: 'Noto Sans JP',
      },
    },
    h('div', {
      style: {
        position: 'absolute',
        top: -140,
        right: -80,
        width: 360,
        height: 360,
        borderRadius: 9999,
        backgroundColor: '#dbeafe',
        opacity: 0.9,
      },
    }),
    h('div', {
      style: {
        position: 'absolute',
        left: -120,
        bottom: -180,
        width: 420,
        height: 420,
        borderRadius: 9999,
        backgroundColor: '#e2e8f0',
        opacity: 0.7,
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
            justifyContent: 'center',
            borderRadius: 32,
            border: '1px solid rgba(148,163,184,0.35)',
            backgroundColor: 'rgba(255,255,255,0.88)',
            padding: '34px 38px',
            boxShadow: '0 18px 50px rgba(15,23,42,0.10)',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              marginTop: 18,
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#334155',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              },
            },
            h('div', {
              style: {
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: '#2563eb',
              },
            }),
            category,
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxWidth: 980,
              },
            },
            ...renderTitleLines(titleLayout.lines, titleLayout.fontSize, titleLayout.lineHeight),
          ),
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              gap: 24,
              marginTop: 42,
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              },
            },
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  fontSize: 24,
                  color: '#0f172a',
                  fontWeight: 700,
                },
              },
              siteTitle,
            ),
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  fontSize: 18,
                  color: '#64748b',
                },
              },
              siteHost,
            ),
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
