import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const POSTS_PER_PAGE = 12;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const contentRoot = path.resolve(appRoot, '../../content/blog');
const notesContentRoot = path.resolve(appRoot, '../../content/notes');
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

function generateSlugFromPath(filePath) {
  return path.basename(filePath).replace(/\.(md|mdx)$/, '');
}

function normalizeFullWidthAscii(value) {
  return value.replace(/[\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  );
}

function normalizeForTagFilter(value) {
  return normalizeFullWidthAscii(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeForSlug(value) {
  return normalizeFullWidthAscii(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTagRouteSegment(tag) {
  const cleaned = tag.trim();
  if (!cleaned) {
    throw new Error('Tag route segment cannot be generated from an empty tag.');
  }

  const normalizedSlug = normalizeForSlug(cleaned);
  if (normalizedSlug) {
    return normalizedSlug;
  }

  const normalizedTagSegment = normalizeForTagFilter(cleaned)
    .replace(/[\s/\\?#]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalizedTagSegment) {
    throw new Error(`Tag route segment cannot be generated from tag: ${tag}`);
  }

  return normalizedTagSegment;
}

function readScalar(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  if (!match) {
    return undefined;
  }

  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function readTags(frontmatter) {
  const rawTags = readScalar(frontmatter, 'tags');
  if (!rawTags) {
    return [];
  }

  if (!rawTags.startsWith('[') || !rawTags.endsWith(']')) {
    return rawTags
      .split(',')
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  const tags = [];
  const pattern = /'([^']*)'|"([^"]*)"|([^,[\]\s][^,\]]*)/g;
  let match;

  while ((match = pattern.exec(rawTags.slice(1, -1)))) {
    tags.push((match[1] ?? match[2] ?? match[3]).trim());
  }

  return tags.filter(Boolean);
}

function extractRedirectMeta(content, filePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`Frontmatter block is missing: ${filePath}`);
  }

  const frontmatter = match[1];
  const draft = readScalar(frontmatter, 'draft') === 'true';

  return {
    slug: readScalar(frontmatter, 'slug') ?? generateSlugFromPath(filePath),
    category: readScalar(frontmatter, 'category') ?? '',
    tags: readTags(frontmatter),
    draft,
  };
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function getTotalPages(count) {
  return Math.ceil(count / POSTS_PER_PAGE);
}

function getArchiveRedirects(basePath, totalPages) {
  const lines = [
    `${basePath}/1 ${basePath}/ 301`,
    `${basePath}/1/ ${basePath}/ 301`,
    `${basePath} ${basePath}/ 301`,
  ];

  for (let page = 2; page <= totalPages; page++) {
    lines.push(`${basePath}/${page} ${basePath}/${page}/ 301`);
  }

  return lines;
}

const files = await getMarkdownFiles(contentRoot);
const noteFiles = await getMarkdownFiles(notesContentRoot);
const posts = [];
const notes = [];
const categoryCounts = new Map();
const tagCounts = new Map();

for (const filePath of files) {
  const content = await readFile(filePath, 'utf8');
  const meta = extractRedirectMeta(content, filePath);

  if (meta.draft) {
    continue;
  }

  posts.push(meta);
  increment(categoryCounts, meta.category.toLowerCase());

  for (const tag of meta.tags) {
    increment(tagCounts, getTagRouteSegment(tag));
  }
}

for (const filePath of noteFiles) {
  const content = await readFile(filePath, 'utf8');
  const meta = extractRedirectMeta(content, filePath);

  if (meta.draft) {
    continue;
  }

  notes.push(meta);
}

const lines = [
  '# Canonical URL redirects',
  '',
  '# The first archive page omits its page number.',
  '/1 / 301',
  '/1/ / 301',
];

for (let page = 2; page <= getTotalPages(posts.length); page++) {
  lines.push(`/${page} /${page}/ 301`);
}

lines.push('', '# Archive pages are collection resources and keep a trailing slash.');
lines.push('/notes /notes/ 301');

for (const [category, count] of [...categoryCounts.entries()].sort(([a], [b]) =>
  a.localeCompare(b),
)) {
  lines.push(...getArchiveRedirects(`/category/${category}`, getTotalPages(count)));
}

for (const [tag, count] of [...tagCounts.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(...getArchiveRedirects(`/tag/${tag}`, getTotalPages(count)));
}

lines.push('', '# Article pages are document resources and omit a trailing slash.');
lines.push(
  '# Cloudflare serves generated post index.html files at trailing-slash URLs by default.',
  '# Proxy canonical post URLs to those files so the browser URL stays slashless.',
);

for (const post of posts.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const encodedSlug = encodeURIComponent(post.slug);
  lines.push(`/post/${encodedSlug} /post/${encodedSlug}/ 200`);
  lines.push(`/post/${encodedSlug}/ /post/${encodedSlug} 301`);
}

for (const note of notes.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const encodedSlug = encodeURIComponent(note.slug);
  lines.push(`/notes/${encodedSlug} /notes/${encodedSlug}/ 200`);
  lines.push(`/notes/${encodedSlug}/ /notes/${encodedSlug} 301`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`Generated ${path.relative(appRoot, outputPath)} with ${lines.length} lines.`);
