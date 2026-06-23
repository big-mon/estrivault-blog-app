import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractMetadata } from '@estrivault/content-processor';
import { getSlugFromMarkdownPath } from '../src/lib/url-segments.mjs';

const POSTS_PER_PAGE = 12;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const contentRoot = path.resolve(appRoot, '../../content/blog');
const outputPath = path.resolve(appRoot, 'public/_redirects');

async function getMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getMarkdownFiles(entryPath);
      }

      return /\.(md|mdx)$/.test(entry.name) ? [entryPath] : [];
    }),
  );

  return files.flat();
}

function getTotalPages(count) {
  return Math.ceil(count / POSTS_PER_PAGE);
}

async function isPublishedPost(content, filePath) {
  const slug = getSlugFromMarkdownPath(filePath);
  const meta = await extractMetadata(content, undefined, slug);

  return meta.draft !== true;
}

const files = await getMarkdownFiles(contentRoot);
let postCount = 0;

for (const filePath of files) {
  const content = await readFile(filePath, 'utf8');
  if (await isPublishedPost(content, filePath)) {
    postCount += 1;
  }
}

const lines = [
  '# Canonical URL redirects',
  '',
  '# The first archive page omits its page number.',
  '/1 / 301',
  '/1/ / 301',
];

for (let page = 2; page <= getTotalPages(postCount); page++) {
  lines.push(`/${page} /${page}/ 301`);
}

lines.push('', '# Archive pages are collection resources and keep a trailing slash.');
lines.push(
  '/notes /notes/ 301',
  '/category/:category/1 /category/:category/ 301',
  '/category/:category/1/ /category/:category/ 301',
  '/category/:category /category/:category/ 301',
  '/category/:category/:page /category/:category/:page/ 301',
  '/tag/:tag/1 /tag/:tag/ 301',
  '/tag/:tag/1/ /tag/:tag/ 301',
  '/tag/:tag /tag/:tag/ 301',
  '/tag/:tag/:page /tag/:tag/:page/ 301',
);

lines.push('', '# Article pages are document resources and omit a trailing slash.');
lines.push(
  '# Cloudflare serves generated document index.html files at trailing-slash URLs by default.',
  '# Proxy canonical document URLs to those files so the browser URL stays slashless.',
  '/post/:slug /post/:slug/ 200',
  '/post/:slug/ /post/:slug 301',
  '/notes/:slug /notes/:slug/ 200',
  '/notes/:slug/ /notes/:slug 301',
);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`Generated ${path.relative(appRoot, outputPath)} with ${lines.length} lines.`);
