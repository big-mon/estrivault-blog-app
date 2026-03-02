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
  cloudinaryCloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
};

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

async function extractFrontmatterOnly(
  filePath: string,
  content: string,
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<PostMeta | null> {
  try {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
      return null;
    }

    const frontmatterOnly = `---\n${frontmatterMatch[1]}\n---\n`;
    const slug = generateSlugFromPath(filePath);
    const meta = await extractMetadata(frontmatterOnly, options, slug);

    if (meta.draft) {
      return null;
    }

    return meta;
  } catch (error) {
    console.warn(`Failed to extract metadata from ${filePath}:`, error);
    return null;
  }
}

export async function getAllPostsMeta(
  options: ProcessorOptions = defaultProcessorOptions,
): Promise<PostMeta[]> {
  const markdownFiles = getMarkdownFiles();

  const postMetaList = await Promise.all(
    Object.entries(markdownFiles).map(([filePath, content]) =>
      extractFrontmatterOnly(filePath, content, options),
    ),
  );

  return postMetaList
    .filter((post): post is PostMeta => post !== null)
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
    try {
      const meta = await extractMetadata(content, options, generateSlugFromPath(filePath));
      if (meta.slug !== slug || meta.draft) {
        continue;
      }

      const post = await processMarkdown(content, options, slug);
      post.originalPath = filePath.replace(/^.*\/content\/blog\//, 'content/blog/');
      return post;
    } catch (error) {
      console.warn(`Skipping invalid markdown file ${filePath}:`, error);
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
    post.tags.forEach((tag) => tagSet.add(tag));
  });

  return [...tagSet].sort((a, b) => a.localeCompare(b));
}
