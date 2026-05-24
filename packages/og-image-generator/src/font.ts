import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import boldFontPath from '../assets/NotoSansJP-Bold.otf';
import regularFontPath from '../assets/NotoSansJP-Regular.otf';

interface LoadedFont {
  data: ArrayBuffer;
  name: string;
  style: 'normal';
  weight: 400 | 700;
}

let fontPromise: Promise<LoadedFont[]> | undefined;
let fontDigestPromise: Promise<string> | undefined;

async function loadFontAsset(assetPath: string): Promise<ArrayBuffer> {
  const buffer = await readFile(new URL(assetPath, import.meta.url));
  const data = new Uint8Array(buffer.byteLength);
  data.set(buffer);
  return data.buffer;
}

export function loadPostOgpFonts(): Promise<LoadedFont[]> {
  if (!fontPromise) {
    fontPromise = Promise.all([
      loadFontAsset(regularFontPath).then((data) => ({
        data,
        name: 'Noto Sans JP',
        style: 'normal' as const,
        weight: 400 as const,
      })),
      loadFontAsset(boldFontPath).then((data) => ({
        data,
        name: 'Noto Sans JP',
        style: 'normal' as const,
        weight: 700 as const,
      })),
    ]);
  }

  return fontPromise;
}

export async function getPostOgpFontDigest(): Promise<string> {
  fontDigestPromise ??= loadPostOgpFonts().then((fonts) => {
    const hash = createHash('sha256');
    for (const font of fonts) {
      hash.update(font.name);
      hash.update(String(font.weight));
      hash.update(Buffer.from(font.data));
    }
    return hash.digest('hex');
  });

  return fontDigestPromise;
}
