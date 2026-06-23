import {
  extractMetadata,
  parseFrontmatter,
  normalizeForTagFilter,
  processMarkdown,
  type PostHTML,
  type PostMeta,
  type ProcessorOptions,
} from '@estrivault/content-processor';
import { getSlugFromMarkdownPath } from './url-segments';

export interface PaginatedPosts {
  posts: PostMeta[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface NoteMeta {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  tags: string[];
}

export interface NoteHTML {
  meta: NoteMeta;
  html: string;
  originalPath?: string;
}

const defaultProcessorOptions: ProcessorOptions = {
  cloudinaryCloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'damonge',
};

interface ContentSource<TMeta extends { slug: string }> {
  filePath: string;
  content: string;
  meta: TMeta;
  originalPath: string;
}

interface ContentIndex<TMeta extends { slug: string }> {
  sources: Array<ContentSource<TMeta>>;
  meta: TMeta[];
  bySlug: Map<string, ContentSource<TMeta>>;
}

let postIndexPromise: Promise<ContentIndex<PostMeta>> | undefined;
let noteIndexPromise: Promise<ContentIndex<NoteMeta>> | undefined;

function getMarkdownFiles(): Record<string, string> {
  const modules = import.meta.glob('@content/blog/**/*.{md,mdx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  return modules as Record<string, string>;
}

function getNoteMarkdownFiles(): Record<string, string> {
  const modules = import.meta.glob('@content/notes/**/*.{md,mdx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  return modules as Record<string, string>;
}

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createExcerpt(markdown: string, maxLength = 120): string {
  const text = stripMarkdown(markdown);
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function normalizeDate(value: unknown, filePath: string, fieldName = 'publishedAt'): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`Required frontmatter field "${fieldName}" is invalid: ${filePath}`);
    }

    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  throw new Error(`Required frontmatter field "${fieldName}" is invalid: ${filePath}`);
}

function normalizeTags(value: unknown): string[] {
  return Array.isArray(value) ?
      value.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim())
    : [];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toOriginalPath(filePath: string, contentRoot: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const rootIndex = normalizedPath.lastIndexOf(contentRoot);

  return rootIndex >= 0 ? normalizedPath.slice(rootIndex) : normalizedPath;
}

function assertUniqueSlugs<TMeta extends { slug: string }>(
  sources: Array<{ filePath: string; meta: TMeta }>,
  options: {
    emptySubject: string;
    duplicateSubject?: string;
  },
): void {
  const slugToPath = new Map<string, string>();

  for (const { filePath, meta } of sources) {
    if (!meta.slug) {
      throw new Error(`${options.emptySubject} slug is empty: ${filePath}`);
    }

    const existingPath = slugToPath.get(meta.slug);
    if (existingPath) {
      const duplicateSubject = options.duplicateSubject ? `${options.duplicateSubject} ` : '';
      throw new Error(
        `Duplicate ${duplicateSubject}slug "${meta.slug}" detected between ${existingPath} and ${filePath}`,
      );
    }

    slugToPath.set(meta.slug, filePath);
  }
}

async function createContentIndex<TMeta extends { slug: string }>(options: {
  markdownFiles: Record<string, string>;
  contentRoot: string;
  emptySlugSubject: string;
  duplicateSlugSubject?: string;
  extractMeta: (filePath: string, content: string) => TMeta | null | Promise<TMeta | null>;
  sortMeta: (a: TMeta, b: TMeta) => number;
}): Promise<ContentIndex<TMeta>> {
  const sources = (
    await Promise.all(
      Object.entries(options.markdownFiles).map(async ([filePath, content]) => {
        const meta = await options.extractMeta(filePath, content);
        if (!meta) {
          return null;
        }

        return {
          filePath,
          content,
          meta,
          originalPath: toOriginalPath(filePath, options.contentRoot),
        } satisfies ContentSource<TMeta>;
      }),
    )
  ).filter((source): source is ContentSource<TMeta> => source !== null);

  assertUniqueSlugs(sources, {
    emptySubject: options.emptySlugSubject,
    duplicateSubject: options.duplicateSlugSubject,
  });

  sources.sort((a, b) => options.sortMeta(a.meta, b.meta));

  return {
    sources,
    meta: sources.map((source) => source.meta),
    bySlug: new Map(sources.map((source) => [source.meta.slug, source])),
  };
}

function extractNoteMeta(filePath: string, content: string): NoteMeta | null {
  const { data, content: markdown } = parseFrontmatter(content);

  if (!data.title) {
    throw new Error(`Required frontmatter field "title" is missing: ${filePath}`);
  }
  if (!data.publishedAt) {
    throw new Error(`Required frontmatter field "publishedAt" is missing: ${filePath}`);
  }
  if (!Array.isArray(data.tags)) {
    throw new Error(`Required frontmatter field "tags" is missing: ${filePath}`);
  }

  const publishedAt = normalizeDate(data.publishedAt, filePath);

  const meta: NoteMeta = {
    slug: (data.slug as string) || getSlugFromMarkdownPath(filePath),
    title: data.title as string,
    excerpt: createExcerpt(markdown, 150),
    publishedAt,
    tags: normalizeTags(data.tags),
  };

  return meta;
}

async function extractFrontmatterOnly(
  filePath: string,
  content: string,
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<PostMeta | null> {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    throw new Error(`Frontmatter block is missing: ${filePath}`);
  }

  try {
    const requiredFrontmatterFields = ['title', 'publishedAt', 'category', 'tags'] as const;
    for (const field of requiredFrontmatterFields) {
      if (!new RegExp(`(^|\\n)${field}\\s*:`, 'm').test(frontmatterMatch[1])) {
        throw new Error(`Required frontmatter field "${field}" is missing: ${filePath}`);
      }
    }

    const slug = getSlugFromMarkdownPath(filePath);
    const meta = await extractMetadata(content, options, slug);

    if (meta.draft) {
      return null;
    }

    return meta;
  } catch (error) {
    throw new Error(`Failed to extract metadata from ${filePath}: ${getErrorMessage(error)}`, {
      cause: error,
    });
  }
}

export async function getAllPostsMeta(
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<PostMeta[]> {
  return (await getPostIndex(options)).meta;
}

async function getPostIndex(
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<ContentIndex<PostMeta>> {
  if (options === defaultProcessorOptions) {
    postIndexPromise ??= loadPostIndex(options);
    return postIndexPromise;
  }

  return loadPostIndex(options);
}

async function loadPostIndex(options: ProcessorOptions): Promise<ContentIndex<PostMeta>> {
  return createContentIndex({
    markdownFiles: getMarkdownFiles(),
    contentRoot: 'content/blog/',
    emptySlugSubject: 'Post',
    extractMeta: (filePath, content) => extractFrontmatterOnly(filePath, content, options),
    sortMeta: (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  });
}

export async function getAllNotesMeta(): Promise<NoteMeta[]> {
  return (await getNoteIndex()).meta;
}

async function getNoteIndex(): Promise<ContentIndex<NoteMeta>> {
  noteIndexPromise ??= loadNoteIndex();
  return noteIndexPromise;
}

async function loadNoteIndex(): Promise<ContentIndex<NoteMeta>> {
  return createContentIndex({
    markdownFiles: getNoteMarkdownFiles(),
    contentRoot: 'content/notes/',
    emptySlugSubject: 'Note',
    duplicateSlugSubject: 'note',
    extractMeta: extractNoteMeta,
    sortMeta: (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  });
}

export async function getNoteBySlug(
  slug: string,
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<NoteHTML | null> {
  const noteIndex = await getNoteIndex();
  const source = noteIndex.bySlug.get(slug);

  if (!source) {
    return null;
  }

  return processNoteSource(source, options);
}

export async function getAllNotes(
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<NoteHTML[]> {
  const noteIndex = await getNoteIndex();

  return Promise.all(noteIndex.sources.map((source) => processNoteSource(source, options)));
}

async function processNoteSource(
  source: ContentSource<NoteMeta>,
  options: ProcessorOptions,
): Promise<NoteHTML> {
  try {
    const processed = await processMarkdown(source.content, options, source.meta.slug);
    return {
      meta: source.meta,
      html: processed.html,
      originalPath: source.originalPath,
    };
  } catch (error) {
    throw new Error(
      `Failed to process note markdown file ${source.filePath}: ${getErrorMessage(error)}`,
      {
        cause: error,
      },
    );
  }
}

export function getRelatedNotes(current: NoteMeta, notes: NoteMeta[], limit = 3): NoteMeta[] {
  const currentTags = new Set(current.tags.map((tag) => normalizeForTagFilter(tag)));

  return notes
    .filter((note) => note.slug !== current.slug)
    .map((note) => {
      const sharedTags = note.tags.filter((tag) => currentTags.has(normalizeForTagFilter(tag)));
      return { note, score: sharedTags.length };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) => b.score - a.score || b.note.publishedAt.getTime() - a.note.publishedAt.getTime(),
    )
    .slice(0, limit)
    .map((item) => item.note);
}

export function filterPosts(
  posts: PostMeta[],
  options?: {
    category?: string;
    tag?: string;
  },
): PostMeta[] {
  let filteredPosts = posts;

  if (options?.category) {
    const normalizedCategory = normalizeForTagFilter(options.category);
    filteredPosts = filteredPosts.filter(
      (post) => normalizeForTagFilter(post.category) === normalizedCategory,
    );
  }

  if (options?.tag) {
    const normalizedTag = normalizeForTagFilter(options.tag);
    filteredPosts = filteredPosts.filter((post) =>
      post.tags.some((tag) => normalizeForTagFilter(tag) === normalizedTag),
    );
  }

  return filteredPosts;
}

export function paginatePosts(
  posts: PostMeta[],
  options?: {
    page?: number;
    perPage?: number;
  },
): PaginatedPosts {
  const page = options?.page || 1;
  const perPage = options?.perPage || 20;
  const total = posts.length;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (page - 1) * perPage;

  return {
    posts: posts.slice(startIndex, startIndex + perPage),
    total,
    page,
    perPage,
    totalPages,
  };
}

export function getPaginatedPosts(
  posts: PostMeta[],
  options?: {
    page?: number;
    perPage?: number;
    category?: string;
    tag?: string;
  },
): PaginatedPosts {
  return paginatePosts(filterPosts(posts, options), options);
}

export async function getPosts(options?: {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
}): Promise<PaginatedPosts> {
  return getPaginatedPosts(await getAllPostsMeta(), options);
}

export async function getPostBySlug(
  slug: string,
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<PostHTML | null> {
  const postIndex = await getPostIndex(options);
  const source = postIndex.bySlug.get(slug);

  if (!source) {
    return null;
  }

  try {
    const post = await processMarkdown(source.content, options, source.meta.slug);
    post.originalPath = source.originalPath;
    return post;
  } catch (error) {
    throw new Error(
      `Failed to process markdown file ${source.filePath}: ${getErrorMessage(error)}`,
      {
        cause: error,
      },
    );
  }
}

export async function getAllCategories(): Promise<string[]> {
  const allPosts = await getAllPostsMeta();
  return [...new Set(allPosts.map((post) => post.category))].sort((a, b) => a.localeCompare(b));
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPostsMeta();
  const tagSet = new Set<string>();

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagSet.add(tag);
    });
  });

  return [...tagSet].sort((a, b) => a.localeCompare(b));
}
