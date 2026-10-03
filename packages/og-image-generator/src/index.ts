import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { createElement as h } from 'react';
import satori from 'satori';
import { getPostOgpFontDigest, loadPostOgpFonts } from './font';
import { layoutPostOgpTitle } from './title-layout';

export interface PostOgpCardData {
  title: string;
  category: string;
  publishedAt: Date | string;
  avatarDataUrl?: string;
}

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const CACHE_SCHEMA_VERSION = 'post-ogp-cache-v3';

export interface PostOgpCacheOptions {
  cacheDir?: string;
}

let templateDigestPromise: Promise<string> | undefined;

function normalizePublishedAt(publishedAt: Date | string): string {
  return publishedAt instanceof Date ? publishedAt.toISOString() : publishedAt;
}

async function readFileForDigest(relativePath: string): Promise<Buffer> {
  return readFile(new URL(relativePath, import.meta.url));
}

async function getPostOgpTemplateDigest(): Promise<string> {
  templateDigestPromise ??= Promise.all([
    readFileForDigest('./index.js'),
    readFileForDigest('./title-layout.js'),
    readFileForDigest('./font.js'),
    getPostOgpFontDigest(),
  ]).then((parts) => {
    const hash = createHash('sha256');
    hash.update(CACHE_SCHEMA_VERSION);
    for (const part of parts) {
      hash.update(part);
    }
    return hash.digest('hex');
  });

  return templateDigestPromise;
}

async function getPostOgpCacheKey(input: PostOgpCardData): Promise<string> {
  const hash = createHash('sha256');
  hash.update(
    JSON.stringify({
      schema: CACHE_SCHEMA_VERSION,
      template: await getPostOgpTemplateDigest(),
      title: input.title,
      category: input.category || 'Other',
      publishedAt: normalizePublishedAt(input.publishedAt),
      avatarDataUrl: input.avatarDataUrl,
    }),
  );
  return hash.digest('hex');
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
          letterSpacing: '-0.05em',
          color: '#303e32',
        },
      },
      line,
    ),
  );
}

async function renderPostOgpPng(input: PostOgpCardData): Promise<Uint8Array> {
  const titleLayout = layoutPostOgpTitle(input.title);
  const category = input.category || 'Other';

  const markup = h(
    'div',
    {
      style: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        display: 'flex',
        padding: 42,
        backgroundColor: '#e8eddf',
        color: '#303e32',
        fontFamily: 'Noto Sans JP',
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
          padding: '38px 46px',
          backgroundColor: '#fffdf2',
          border: '1px solid #c8ceba',
          borderRadius: 24,
          boxShadow: '0 12px 24px rgba(48,62,50,0.10)',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 20 } },
          input.avatarDataUrl ?
            h('img', {
              src: input.avatarDataUrl,
              width: 76,
              height: 76,
              style: { borderRadius: '50%', objectFit: 'cover' },
            })
          : h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  backgroundColor: '#e8eddf',
                  fontSize: 32,
                },
              },
              'E',
            ),
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            h('div', { style: { display: 'flex', fontSize: 26, fontWeight: 700 } }, 'big-mon'),
            h('div', { style: { display: 'flex', fontSize: 22, color: '#586454' } }, 'Estrilda'),
          ),
        ),
        h('div', {
          style: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#536d53' },
        }),
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' } },
        ...renderTitleLines(titleLayout.lines, titleLayout.fontSize, titleLayout.lineHeight),
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h(
          'div',
          {
            style: {
              display: 'flex',
              padding: '8px 18px',
              borderRadius: 24,
              backgroundColor: '#e8eddf',
              color: '#536d53',
              fontSize: 22,
              fontWeight: 700,
            },
          },
          category,
        ),
        h(
          'div',
          { style: { display: 'flex', fontSize: 18, color: '#586454' } },
          'estrilda.damonge.com',
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

export async function generatePostOgpPng(
  input: PostOgpCardData,
  options: PostOgpCacheOptions = {},
): Promise<Uint8Array> {
  if (!options.cacheDir) {
    return renderPostOgpPng(input);
  }

  const cacheKey = await getPostOgpCacheKey(input);
  const cachePath = path.join(options.cacheDir, `${cacheKey}.png`);

  try {
    return await readFile(cachePath);
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
      throw error;
    }
  }

  const png = await renderPostOgpPng(input);
  await mkdir(options.cacheDir, { recursive: true });

  const temporaryPath = `${cachePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, png);
  await rename(temporaryPath, cachePath);

  return png;
}
