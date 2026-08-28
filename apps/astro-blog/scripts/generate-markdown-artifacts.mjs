import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  extractMetadata,
  parseFrontmatter,
  renderPublicMarkdownBody,
  serializePublicMarkdown,
} from '@estrivault/content-processor';
import {
  CATEGORY_META,
  PUBLIC_MARKDOWN_AUTHOR,
  PUBLIC_MARKDOWN_LANGUAGE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from '../src/constants/site-metadata.mjs';
import {
  encodeRouteSegment,
  getArchivePagePath,
  getSlugFromMarkdownPath,
} from '../src/lib/url-segments.mjs';

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultRepositoryRoot = path.resolve(appDirectory, '../..');
const defaultSite = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  author: PUBLIC_MARKDOWN_AUTHOR,
  url: SITE_URL,
  language: PUBLIC_MARKDOWN_LANGUAGE,
};

/**
 * Build one public article Markdown artifact from canonical source content.
 */
export function renderArticleMarkdown({ source, meta, site, canonicalUrl, processorOptions = {} }) {
  const body = renderPublicMarkdownBody(source, meta.title, processorOptions);
  return serializePublicMarkdown(
    {
      title: meta.title,
      description: meta.description || `${meta.title}についての記事です。`,
      canonical_url: canonicalUrl,
      site_name: site.title,
      site_url: site.url,
      language: site.language,
      content_type: 'article',
      author: site.author,
      date_published: toIsoDate(meta.publishedAt),
      date_modified: toIsoDate(meta.updatedAt || meta.publishedAt),
      category: meta.category,
      tags: Array.isArray(meta.tags) ? [...meta.tags] : [],
      featured_image: meta.coverImage || null,
    },
    body,
  );
}

/**
 * Build one public note Markdown artifact from canonical source content.
 */
export function renderNoteMarkdown({ source, meta, site, canonicalUrl, processorOptions = {} }) {
  const body = renderPublicMarkdownBody(source, meta.title, processorOptions);
  const description = createMarkdownDescription(body);

  return serializePublicMarkdown(
    {
      title: meta.title,
      description: description || `${meta.title}の短文Noteです。`,
      canonical_url: canonicalUrl,
      site_name: site.title,
      site_url: site.url,
      language: site.language,
      content_type: 'note',
      author: site.author,
      date_published: toIsoDate(meta.publishedAt),
      date_modified: toIsoDate(meta.publishedAt),
      category: 'Note',
      tags: Array.isArray(meta.tags) ? [...meta.tags] : [],
      featured_image: null,
    },
    body,
  );
}

/**
 * Build the homepage representation directly from site and content metadata.
 */
export function renderHomepageMarkdown({ site, posts, notes, categories }) {
  const latestPosts = [...posts].sort(comparePublishedAt).slice(0, 5);
  const latestNotes = [...notes].sort(comparePublishedAt).slice(0, 4);

  const body = [
    `# ${site.title}`,
    '',
    `> ${site.description}`,
    '',
    '## Archive summary',
    '',
    `- Articles: ${posts.length}`,
    `- Categories: ${categories.length}`,
    `- Notes: ${notes.length}`,
    '',
    '## Category index',
    '',
    ...categories.map(
      (category) =>
        `- [${category.label}](${getArchivePagePath(`/category/${encodeRouteSegment(category.slug)}`, 1)}) — ${category.description}`,
    ),
    '',
    '## Latest posts',
    '',
    ...latestPosts.map(
      (post) =>
        `- [${post.title}](${getDocumentUrl(site.url, 'post', post.slug)}) — ${formatDate(post.publishedAt)} — ${post.category}`,
    ),
    '',
    '## Latest notes',
    '',
    ...latestNotes.map(
      (note) =>
        `- [${note.title}](${getDocumentUrl(site.url, 'notes', note.slug)}) — ${formatDate(note.publishedAt)}`,
    ),
    '',
    '## Discovery',
    '',
    '- [LLM discovery guide](/llms.txt)',
    '- [Markdown sitemap](/sitemap.md)',
  ].join('\n');

  return serializePublicMarkdown(
    {
      title: site.title,
      description: site.description,
      canonical_url: site.url,
      site_name: site.title,
      site_url: site.url,
      language: site.language,
      content_type: 'website',
      author: site.author,
    },
    body,
  );
}

/**
 * Generate the exact Markdown sidecar set after the Astro static build.
 */
export async function generateMarkdownArtifacts(options = {}) {
  const repositoryRoot = options.repositoryRoot || defaultRepositoryRoot;
  const distDirectory = options.distDirectory || path.join(appDirectory, 'dist');
  const site = options.site || defaultSite;
  const contentDirectory = path.join(repositoryRoot, 'content');
  const postSources = await collectMarkdownFiles(path.join(contentDirectory, 'blog'));
  const noteSources = await collectMarkdownFiles(path.join(contentDirectory, 'notes'));
  const processorOptions = {
    cloudinaryCloudName: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'damonge',
  };

  const posts = (
    await Promise.all(
      postSources.map(async (filePath) => {
        const source = await readFile(filePath, 'utf8');
        const meta = await extractPostMeta(filePath, source, processorOptions);
        return meta ? { filePath, source, meta } : null;
      }),
    )
  ).filter(Boolean);
  const notes = await Promise.all(
    noteSources.map(async (filePath) => {
      const source = await readFile(filePath, 'utf8');
      return { filePath, source, meta: extractNoteMeta(filePath, source) };
    }),
  );

  assertUniqueSlugs(posts, 'post');
  assertUniqueSlugs(notes, 'note');
  posts.sort((a, b) => comparePublishedAt(a.meta, b.meta));
  notes.sort((a, b) => comparePublishedAt(a.meta, b.meta));

  const categories = Object.entries(CATEGORY_META)
    .filter(([slug]) => slug !== 'meta')
    .map(([slug, category]) => ({ slug, ...category }));
  const outputs = [
    {
      relativePath: 'index.md',
      content: renderHomepageMarkdown({
        site,
        posts: posts.map(({ meta }) => meta),
        notes: notes.map(({ meta }) => meta),
        categories,
      }),
    },
    ...posts.map(({ source, meta }) => ({
      relativePath: path.join('post', meta.slug, 'index.md'),
      content: renderArticleMarkdown({
        source,
        meta,
        site,
        canonicalUrl: getDocumentUrl(site.url, 'post', meta.slug),
        processorOptions,
      }),
    })),
    ...notes.map(({ source, meta }) => ({
      relativePath: path.join('notes', meta.slug, 'index.md'),
      content: renderNoteMarkdown({
        source,
        meta,
        site,
        canonicalUrl: getDocumentUrl(site.url, 'notes', meta.slug),
        processorOptions,
      }),
    })),
  ];

  await Promise.all(
    outputs.map(async ({ relativePath, content }) => {
      const filePath = path.join(distDirectory, relativePath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content, 'utf8');
    }),
  );

  return {
    articleCount: posts.length,
    noteCount: notes.length,
    artifactCount: outputs.length,
    files: outputs.map(({ relativePath }) => relativePath),
  };
}

async function extractPostMeta(filePath, source, processorOptions) {
  const { data } = parseFrontmatter(source);
  assertRequiredFields(data, ['title', 'publishedAt', 'category', 'tags'], filePath);
  const slug = getSlugFromMarkdownPath(filePath);
  const meta = await extractMetadata(source, processorOptions, slug);
  return meta.draft ? null : meta;
}

function extractNoteMeta(filePath, source) {
  const { data } = parseFrontmatter(source);
  assertRequiredFields(data, ['title', 'publishedAt', 'tags'], filePath);

  return {
    slug:
      typeof data.slug === 'string' && data.slug ? data.slug : getSlugFromMarkdownPath(filePath),
    title: String(data.title),
    publishedAt: normalizeDate(data.publishedAt, filePath),
    tags: normalizeTags(data.tags),
  };
}

function assertRequiredFields(data, fields, filePath) {
  for (const field of fields) {
    if (!(field in data)) {
      throw new Error(`Required frontmatter field "${field}" is missing: ${filePath}`);
    }
  }
}

function normalizeDate(value, filePath) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Required frontmatter field "publishedAt" is invalid: ${filePath}`);
  }
  return date;
}

function normalizeTags(value) {
  return Array.isArray(value) ?
      value.filter((tag) => typeof tag === 'string').map((tag) => tag.trim())
    : [];
}

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(filePath)));
    } else if (entry.isFile() && /\.(?:md|mdx)$/i.test(entry.name)) {
      files.push(filePath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function assertUniqueSlugs(entries, subject) {
  const seen = new Map();
  for (const entry of entries) {
    const slug = entry.meta.slug;
    const previous = seen.get(slug);
    if (previous) {
      throw new Error(
        `Duplicate ${subject} slug "${slug}" detected between ${previous} and ${entry.filePath}`,
      );
    }
    if (!slug) {
      throw new Error(`${subject} slug is empty: ${entry.filePath}`);
    }
    if (
      typeof slug !== 'string' ||
      slug === '.' ||
      slug === '..' ||
      slug.includes('/') ||
      slug.includes('\\') ||
      slug.includes('\0')
    ) {
      throw new Error(
        `Invalid ${subject} slug ${JSON.stringify(slug)}: must be a single filesystem-safe path segment without ".", "..", "/", "\\", or NUL: ${entry.filePath}`,
      );
    }
    seen.set(slug, entry.filePath);
  }
}

function createMarkdownDescription(body) {
  const content = body.slice(body.indexOf('\n') + 1);
  const text = stripMarkdown(content);
  return text.length > 150 ? `${text.slice(0, 150).trim()}...` : text;
}

function stripMarkdown(markdown) {
  const lines = markdown.split(/\r\n|\n|\r/);
  const visibleLines = [];
  let inFence = false;

  for (const originalLine of lines) {
    const line = originalLine.trimStart();
    if (/^(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      visibleLines.push(originalLine);
    }
  }

  return visibleLines
    .join(' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*(?:[-*+] |\d+\. )/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function comparePublishedAt(a, b) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function toIsoDate(value) {
  return new Date(value).toISOString();
}

function formatDate(value) {
  return toIsoDate(value).slice(0, 10);
}

function getDocumentUrl(siteUrl, route, slug) {
  return `${siteUrl.replace(/\/$/, '')}/${route}/${encodeRouteSegment(slug)}`;
}

const currentModuleUrl = pathToFileURL(path.resolve(process.argv[1] || '')).href;
if (import.meta.url === currentModuleUrl) {
  const result = await generateMarkdownArtifacts();
  console.log(
    `Generated ${result.artifactCount} Markdown artifacts (${result.articleCount} posts, ${result.noteCount} notes).`,
  );
}
