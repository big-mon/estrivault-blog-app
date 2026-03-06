import {
  extractMetadata,
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

const defaultProcessorOptions: ProcessorOptions = {
  cloudinaryCloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'damonge',
};

interface PostMetaSource {
  filePath: string;
  meta: PostMeta | null;
}

function getMarkdownFiles(): Record<string, string> {
  const modules = import.meta.glob('@content/blog/**/*.{md,mdx}', {
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
    throw new Error(`Failed to extract metadata from ${filePath}: ${getErrorMessage(error)}`);
  }
}

export async function getAllPostsMeta(
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<PostMeta[]> {
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

export async function getPosts(options?: {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
}): Promise<PaginatedPosts> {
  const page = options?.page || 1;
  const perPage = options?.perPage || 20;

  let filteredPosts = await getAllPostsMeta();

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

  const total = filteredPosts.length;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (page - 1) * perPage;
  const posts = filteredPosts.slice(startIndex, startIndex + perPage);

  return {
    posts,
    total,
    page,
    perPage,
    totalPages,
  };
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
      throw new Error(`Invalid markdown file ${filePath}: ${getErrorMessage(error)}`);
    }

    if (meta.slug !== slug || meta.draft) {
      continue;
    }

    try {
      const post = await processMarkdown(content, options, slug);
      post.originalPath = filePath.replace(/^.*\/content\/blog\//, 'content/blog/');
      return post;
    } catch (error) {
      throw new Error(`Failed to process markdown file ${filePath}: ${getErrorMessage(error)}`);
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
