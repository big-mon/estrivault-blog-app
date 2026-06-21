import {
  extractMetadata,
  parseFrontmatter,
  normalizeForTagFilter,
  processMarkdown,
  type PostHTML,
  type PostMeta,
  type ProcessorOptions,
} from '@estrivault/content-processor';

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

interface PostMetaSource {
  filePath: string;
  meta: PostMeta | null;
}

let allPostsMetaPromise: Promise<PostMeta[]> | undefined;
let allNotesMetaPromise: Promise<NoteMeta[]> | undefined;

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

function generateSlugFromPath(filePath: string): string {
  const pathParts = filePath.split('/');
  const filename = pathParts[pathParts.length - 1];
  if (!filename) {
    return '';
  }

  return filename.replace(/\.(md|mdx)$/, '');
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

function normalizeDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

function normalizeTags(value: unknown): string[] {
  return Array.isArray(value) ?
      value.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim())
    : [];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function assertUniqueSlugs(posts: Array<{ filePath: string; meta: PostMeta }>): void {
  const slugToPath = new Map<string, string>();

  for (const { filePath, meta } of posts) {
    if (!meta.slug) {
      throw new Error(`Post slug is empty: ${filePath}`);
    }

    const existingPath = slugToPath.get(meta.slug);
    if (existingPath) {
      throw new Error(
        `Duplicate slug "${meta.slug}" detected between ${existingPath} and ${filePath}`,
      );
    }

    slugToPath.set(meta.slug, filePath);
  }
}

function assertUniqueNoteSlugs(notes: Array<{ filePath: string; meta: NoteMeta }>): void {
  const slugToPath = new Map<string, string>();

  for (const { filePath, meta } of notes) {
    if (!meta.slug) {
      throw new Error(`Note slug is empty: ${filePath}`);
    }

    const existingPath = slugToPath.get(meta.slug);
    if (existingPath) {
      throw new Error(
        `Duplicate note slug "${meta.slug}" detected between ${existingPath} and ${filePath}`,
      );
    }

    slugToPath.set(meta.slug, filePath);
  }
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

  const publishedAt = normalizeDate(data.publishedAt);

  const meta: NoteMeta = {
    slug: (data.slug as string) || generateSlugFromPath(filePath),
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

    const slug = generateSlugFromPath(filePath);
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
  if (options === defaultProcessorOptions) {
    allPostsMetaPromise ??= loadAllPostsMeta(options);
    return allPostsMetaPromise;
  }

  return loadAllPostsMeta(options);
}

async function loadAllPostsMeta(options: ProcessorOptions): Promise<PostMeta[]> {
  const markdownFiles = getMarkdownFiles();

  const postMetaSources = await Promise.all(
    Object.entries(markdownFiles).map(
      async ([filePath, content]): Promise<PostMetaSource> => ({
        filePath,
        meta: await extractFrontmatterOnly(filePath, content, options),
      }),
    ),
  );

  const validPostSources = postMetaSources.filter(
    (source): source is { filePath: string; meta: PostMeta } => source.meta !== null,
  );

  assertUniqueSlugs(validPostSources);

  return validPostSources
    .map((source) => source.meta)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getAllNotesMeta(): Promise<NoteMeta[]> {
  allNotesMetaPromise ??= loadAllNotesMeta();
  return allNotesMetaPromise;
}

async function loadAllNotesMeta(): Promise<NoteMeta[]> {
  const markdownFiles = getNoteMarkdownFiles();

  const noteMetaSources = Object.entries(markdownFiles).map(([filePath, content]) => ({
    filePath,
    meta: extractNoteMeta(filePath, content),
  }));

  const validNoteSources = noteMetaSources.filter(
    (source): source is { filePath: string; meta: NoteMeta } => source.meta !== null,
  );

  assertUniqueNoteSlugs(validNoteSources);

  return validNoteSources
    .map((source) => source.meta)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getNoteBySlug(
  slug: string,
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<NoteHTML | null> {
  const markdownFiles = getNoteMarkdownFiles();

  for (const [filePath, content] of Object.entries(markdownFiles)) {
    const meta = extractNoteMeta(filePath, content);

    if (!meta || meta.slug !== slug) {
      continue;
    }

    try {
      const processed = await processMarkdown(content, options, slug);
      return {
        meta,
        html: processed.html,
        originalPath: filePath.replace(/^.*\/content\/notes\//, 'content/notes/'),
      };
    } catch (error) {
      throw new Error(
        `Failed to process note markdown file ${filePath}: ${getErrorMessage(error)}`,
        {
          cause: error,
        },
      );
    }
  }

  return null;
}

export async function getAllNotes(
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<NoteHTML[]> {
  const noteMeta = await getAllNotesMeta();
  const notes = await Promise.all(noteMeta.map((note) => getNoteBySlug(note.slug, options)));

  return notes.filter((note): note is NoteHTML => note !== null);
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
  const markdownFiles = getMarkdownFiles();

  for (const [filePath, content] of Object.entries(markdownFiles)) {
    const generatedSlug = generateSlugFromPath(filePath);
    let meta: PostMeta;

    try {
      meta = await extractMetadata(content, options, generatedSlug);
    } catch (error) {
      throw new Error(`Invalid markdown file ${filePath}: ${getErrorMessage(error)}`, {
        cause: error,
      });
    }

    if (meta.slug !== slug || meta.draft) {
      continue;
    }

    try {
      const post = await processMarkdown(content, options, slug);
      post.originalPath = filePath.replace(/^.*\/content\/blog\//, 'content/blog/');
      return post;
    } catch (error) {
      throw new Error(`Failed to process markdown file ${filePath}: ${getErrorMessage(error)}`, {
        cause: error,
      });
    }
  }

  return null;
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
