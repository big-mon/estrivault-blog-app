import type { PostMeta } from '@estrivault/content-processor';
import { getCategoryMeta, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '$constants';
import { getAllNotesMeta, getAllPostsMeta, type NoteMeta } from '$lib/content';
import { encodeRouteSegment, getCategoryRouteSegment, getTagRouteMap } from '$lib/url-segments.mjs';

export const API_VERSION = '1' as const;
export const SITE_BASE_URL = SITE_URL.replace(/\/$/, '');
export const API_ROOT_URL = `${SITE_BASE_URL}/api/v1`;
export const API_INDEX_URL = `${API_ROOT_URL}/index.json`;
export const API_CATALOG_URL = `${SITE_BASE_URL}/.well-known/api-catalog`;

export interface ApiRepresentation {
  url: string;
  media_type: 'text/html' | 'text/markdown';
  request_headers?: { Accept: 'text/markdown' };
}

export interface PublicPostItem {
  slug: string;
  title: string;
  description: string;
  canonical_url: string;
  date_published: string;
  date_modified: string;
  category: {
    slug: string;
    label: string;
  };
  tags: string[];
  representations: {
    html: ApiRepresentation;
    markdown: ApiRepresentation;
  };
}

export interface PublicNoteItem {
  slug: string;
  title: string;
  description: string;
  canonical_url: string;
  date_published: string;
  date_modified: string;
  tags: string[];
  representations: {
    html: ApiRepresentation;
    markdown: ApiRepresentation;
  };
}

export interface PublicCollection<TItem> {
  api_version: typeof API_VERSION;
  content_modified_at: string;
  total: number;
  sort: '-date_published';
  items: TItem[];
}

export interface ApiIndex {
  api_version: typeof API_VERSION;
  site: {
    name: string;
    description: string;
    url: string;
  };
  content_modified_at: string;
  links: {
    posts: string;
    categories: string;
    tags: string;
    notes: string;
    openapi: string;
    api_catalog: string;
  };
}

export interface CategoryItem {
  slug: string;
  label: string;
  description: string;
  article_count: number;
  html_url: string;
  api_url: string;
}

export interface TaxonomyCollection<TItem> {
  api_version: typeof API_VERSION;
  content_modified_at: string;
  total: number;
  sort: 'slug';
  items: TItem[];
}

export type CategoryDetail = PublicCollection<PublicPostItem> & {
  category: CategoryItem;
};

export interface TagItem {
  slug: string;
  label: string;
  article_count: number;
  html_url: string;
  api_url: string;
}

export type TagDetail = PublicCollection<PublicPostItem> & {
  tag: TagItem;
};

export const PUBLIC_API_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
} as const;

export function jsonResponse(value: unknown): Response {
  return new Response(`${JSON.stringify(value)}\n`, {
    headers: PUBLIC_API_HEADERS,
  });
}

export async function getApiIndex(): Promise<ApiIndex> {
  const [posts, notes] = await Promise.all([getAllPostsMeta(), getAllNotesMeta()]);
  const postItems = posts.map(toPostItem);
  const noteItems = notes.map(toNoteItem);

  return {
    api_version: API_VERSION,
    site: {
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
    },
    content_modified_at: getContentModifiedAt([
      ...postItems.flatMap((item) => [item.date_published, item.date_modified]),
      ...noteItems.flatMap((item) => [item.date_published, item.date_modified]),
    ]),
    links: {
      posts: `${API_ROOT_URL}/posts.json`,
      categories: `${API_ROOT_URL}/categories.json`,
      tags: `${API_ROOT_URL}/tags.json`,
      notes: `${API_ROOT_URL}/notes.json`,
      openapi: `${API_ROOT_URL}/openapi.json`,
      api_catalog: API_CATALOG_URL,
    },
  };
}

export async function getPostsCollection(): Promise<PublicCollection<PublicPostItem>> {
  return createPostCollection(await getAllPostsMeta());
}

export async function getNotesCollection(): Promise<PublicCollection<PublicNoteItem>> {
  const notes = (await getAllNotesMeta()).map(toNoteItem).sort(compareNoteItems);
  return createCollection(notes);
}

export async function getCategoriesCollection(): Promise<TaxonomyCollection<CategoryItem>> {
  const posts = await getAllPostsMeta();
  const items = getCategoryItems(posts);

  return {
    api_version: API_VERSION,
    content_modified_at: getContentModifiedAt(getPostDateValues(posts)),
    total: items.length,
    sort: 'slug',
    items,
  };
}

export async function getCategoryDetail(categorySlug: string): Promise<CategoryDetail | null> {
  const posts = await getAllPostsMeta();
  const category = getCategoryItems(posts).find((item) => item.slug === categorySlug);
  if (!category) {
    return null;
  }

  return {
    ...createPostCollection(
      posts.filter((post) => getCategoryRouteSegment(post.category) === category.slug),
    ),
    category,
  };
}

export async function getTagsCollection(): Promise<TaxonomyCollection<TagItem>> {
  const posts = await getAllPostsMeta();
  const items = getTagItems(posts);

  return {
    api_version: API_VERSION,
    content_modified_at: getContentModifiedAt(getPostDateValues(posts)),
    total: items.length,
    sort: 'slug',
    items,
  };
}

export async function getTagDetail(tagSlug: string): Promise<TagDetail | null> {
  const posts = await getAllPostsMeta();
  const tag = getTagItems(posts).find((item) => item.slug === tagSlug);
  if (!tag) {
    return null;
  }

  return {
    ...createPostCollection(posts.filter((post) => post.tags.includes(tag.label))),
    tag,
  };
}

export function getApiCatalog() {
  return {
    linkset: [
      {
        anchor: API_INDEX_URL,
        'service-desc': [
          {
            href: `${API_ROOT_URL}/openapi.json`,
            type: 'application/json',
          },
        ],
        'service-doc': [
          {
            href: `${SITE_BASE_URL}/llms.txt`,
            type: 'text/markdown',
          },
        ],
      },
    ],
  };
}

export const API_CATALOG_HEADERS = {
  'Content-Type': 'application/linkset+json; charset=utf-8',
  Link: '</.well-known/api-catalog>; rel="api-catalog"',
  'Access-Control-Allow-Origin': '*',
  'X-Content-Type-Options': 'nosniff',
} as const;

export function apiCatalogResponse(): Response {
  return new Response(`${JSON.stringify(getApiCatalog())}\n`, {
    headers: API_CATALOG_HEADERS,
  });
}

export function getOpenApiDocument() {
  type OpenApiParameter = {
    name: string;
    in: 'path';
    required: true;
    schema: { type: 'string' };
  };
  const postCollectionProperties = {
    api_version: { const: API_VERSION },
    content_modified_at: { type: 'string', format: 'date-time' },
    total: { type: 'integer', minimum: 0 },
    sort: { type: 'string', enum: ['-date_published'] },
    items: { type: 'array', items: { $ref: '#/components/schemas/PostItem' } },
  };
  const noteCollectionProperties = {
    ...postCollectionProperties,
    items: { type: 'array', items: { $ref: '#/components/schemas/NoteItem' } },
  };
  const taxonomyCollectionProperties = (itemSchema: string) => ({
    api_version: { const: API_VERSION },
    content_modified_at: { type: 'string', format: 'date-time' },
    total: { type: 'integer', minimum: 0 },
    sort: { type: 'string', enum: ['slug'] },
    items: { type: 'array', items: { $ref: `#/components/schemas/${itemSchema}` } },
  });
  const collectionRequired = ['api_version', 'content_modified_at', 'total', 'sort', 'items'];
  const getOperation = (
    operationId: string,
    schema: string,
    parameters: OpenApiParameter[] = [],
  ) => ({
    operationId,
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${schema}` },
          },
        },
      },
    },
    ...(parameters.length > 0 ? { parameters } : {}),
  });

  return {
    openapi: '3.1.0',
    info: {
      title: `${SITE_TITLE} public content API`,
      description:
        'A static, read-only API for discovering and narrowing public articles and Notes.',
      version: API_VERSION,
    },
    servers: [{ url: SITE_BASE_URL }],
    paths: {
      '/api/v1/index.json': {
        get: getOperation('getApiIndex', 'ApiIndex'),
      },
      '/api/v1/posts.json': {
        get: getOperation('listPosts', 'PostCollection'),
      },
      '/api/v1/categories.json': {
        get: getOperation('listCategories', 'CategoryCollection'),
      },
      '/api/v1/categories/{slug}.json': {
        get: getOperation('getCategory', 'CategoryDetail', [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ]),
      },
      '/api/v1/tags.json': {
        get: getOperation('listTags', 'TagCollection'),
      },
      '/api/v1/tags/{tag}.json': {
        get: getOperation('getTag', 'TagDetail', [
          {
            name: 'tag',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ]),
      },
      '/api/v1/notes.json': {
        get: getOperation('listNotes', 'NoteCollection'),
      },
      '/api/v1/openapi.json': {
        get: getOperation('getOpenApiDocument', 'OpenApiDocument'),
      },
    },
    components: {
      schemas: {
        ApiIndex: {
          type: 'object',
          required: ['api_version', 'site', 'content_modified_at', 'links'],
          properties: {
            api_version: { const: API_VERSION },
            site: {
              type: 'object',
              required: ['name', 'description', 'url'],
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                url: { type: 'string', format: 'uri' },
              },
            },
            content_modified_at: { type: 'string', format: 'date-time' },
            links: {
              type: 'object',
              required: ['posts', 'categories', 'tags', 'notes', 'openapi', 'api_catalog'],
              properties: {
                posts: { type: 'string', format: 'uri' },
                categories: { type: 'string', format: 'uri' },
                tags: { type: 'string', format: 'uri' },
                notes: { type: 'string', format: 'uri' },
                openapi: { type: 'string', format: 'uri' },
                api_catalog: { type: 'string', format: 'uri' },
              },
            },
          },
        },
        HtmlRepresentation: {
          type: 'object',
          required: ['url', 'media_type'],
          properties: {
            url: { type: 'string', format: 'uri' },
            media_type: { const: 'text/html' },
          },
        },
        MarkdownRepresentation: {
          type: 'object',
          required: ['url', 'media_type', 'request_headers'],
          properties: {
            url: { type: 'string', format: 'uri' },
            media_type: { const: 'text/markdown' },
            request_headers: {
              type: 'object',
              required: ['Accept'],
              properties: {
                Accept: { const: 'text/markdown' },
              },
            },
          },
        },
        PostItem: {
          type: 'object',
          required: [
            'slug',
            'title',
            'description',
            'canonical_url',
            'date_published',
            'date_modified',
            'category',
            'tags',
            'representations',
          ],
          properties: {
            slug: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            canonical_url: { type: 'string', format: 'uri' },
            date_published: { type: 'string', format: 'date-time' },
            date_modified: { type: 'string', format: 'date-time' },
            category: {
              type: 'object',
              required: ['slug', 'label'],
              properties: {
                slug: { type: 'string' },
                label: { type: 'string' },
              },
            },
            tags: { type: 'array', items: { type: 'string' } },
            representations: {
              type: 'object',
              required: ['html', 'markdown'],
              properties: {
                html: { $ref: '#/components/schemas/HtmlRepresentation' },
                markdown: { $ref: '#/components/schemas/MarkdownRepresentation' },
              },
            },
          },
        },
        NoteItem: {
          type: 'object',
          required: [
            'slug',
            'title',
            'description',
            'canonical_url',
            'date_published',
            'date_modified',
            'tags',
            'representations',
          ],
          properties: {
            slug: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            canonical_url: { type: 'string', format: 'uri' },
            date_published: { type: 'string', format: 'date-time' },
            date_modified: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' } },
            representations: {
              type: 'object',
              required: ['html', 'markdown'],
              properties: {
                html: { $ref: '#/components/schemas/HtmlRepresentation' },
                markdown: { $ref: '#/components/schemas/MarkdownRepresentation' },
              },
            },
          },
        },
        CategoryItem: {
          type: 'object',
          required: ['slug', 'label', 'description', 'article_count', 'html_url', 'api_url'],
          properties: {
            slug: { type: 'string' },
            label: { type: 'string' },
            description: { type: 'string' },
            article_count: { type: 'integer', minimum: 0 },
            html_url: { type: 'string', format: 'uri' },
            api_url: { type: 'string', format: 'uri' },
          },
        },
        TagItem: {
          type: 'object',
          required: ['slug', 'label', 'article_count', 'html_url', 'api_url'],
          properties: {
            slug: { type: 'string' },
            label: { type: 'string' },
            article_count: { type: 'integer', minimum: 0 },
            html_url: { type: 'string', format: 'uri' },
            api_url: { type: 'string', format: 'uri' },
          },
        },
        PostCollection: {
          type: 'object',
          required: collectionRequired,
          properties: postCollectionProperties,
        },
        NoteCollection: {
          type: 'object',
          required: collectionRequired,
          properties: noteCollectionProperties,
        },
        CategoryCollection: {
          type: 'object',
          required: ['api_version', 'content_modified_at', 'total', 'sort', 'items'],
          properties: taxonomyCollectionProperties('CategoryItem'),
        },
        CategoryDetail: {
          type: 'object',
          required: [...collectionRequired, 'category'],
          properties: {
            ...postCollectionProperties,
            category: { $ref: '#/components/schemas/CategoryItem' },
          },
        },
        TagCollection: {
          type: 'object',
          required: ['api_version', 'content_modified_at', 'total', 'sort', 'items'],
          properties: taxonomyCollectionProperties('TagItem'),
        },
        TagDetail: {
          type: 'object',
          required: [...collectionRequired, 'tag'],
          properties: {
            ...postCollectionProperties,
            tag: { $ref: '#/components/schemas/TagItem' },
          },
        },
        OpenApiDocument: {
          type: 'object',
          required: ['openapi', 'info', 'servers', 'paths'],
          properties: {
            openapi: { type: 'string', pattern: '^3\\.1\\.' },
            info: { type: 'object' },
            servers: { type: 'array' },
            paths: { type: 'object' },
            components: { type: 'object' },
          },
        },
      },
    },
  };
}

function createPostCollection(posts: PostMeta[]): PublicCollection<PublicPostItem> {
  const items = posts.map(toPostItem).sort(comparePostItems);
  return createCollection(items);
}

function getCategoryItems(posts: PostMeta[]): CategoryItem[] {
  const categoryNames = new Map<string, string>();
  for (const post of posts) {
    const slug = getCategoryRouteSegment(post.category);
    categoryNames.set(slug, categoryNames.get(slug) ?? post.category);
  }

  return [...categoryNames.entries()]
    .sort(([left], [right]) => compareStrings(left, right))
    .map(([slug, categoryName]) => {
      const articleCount = posts.filter(
        (post) => getCategoryRouteSegment(post.category) === slug,
      ).length;
      const encodedSlug = encodeRouteSegment(slug);

      return {
        slug,
        label: getCategoryMeta(categoryName).label,
        description: getCategoryMeta(categoryName).description,
        article_count: articleCount,
        html_url: `${SITE_BASE_URL}/category/${encodedSlug}/`,
        api_url: `${API_ROOT_URL}/categories/${encodedSlug}.json`,
      };
    });
}

function getTagItems(posts: PostMeta[]): TagItem[] {
  const labels = [...new Set(posts.flatMap((post) => post.tags))].sort(compareStrings);
  const routeMap = getTagRouteMap(labels);

  return labels
    .map((label) => {
      const slug = routeMap.get(label);
      if (!slug) {
        throw new Error(`No route segment found for public tag: ${label}`);
      }

      const encodedSlug = encodeRouteSegment(slug);
      return {
        slug,
        label,
        article_count: posts.filter((post) => post.tags.includes(label)).length,
        html_url: `${SITE_BASE_URL}/tag/${encodedSlug}/`,
        api_url: `${API_ROOT_URL}/tags/${encodedSlug}.json`,
      };
    })
    .sort((left, right) => compareStrings(left.slug, right.slug));
}

function createCollection<TItem extends { date_published: string; date_modified: string }>(
  items: TItem[],
): PublicCollection<TItem> {
  return {
    api_version: API_VERSION,
    content_modified_at: getContentModifiedAt(
      items.flatMap((item) => [item.date_published, item.date_modified]),
    ),
    total: items.length,
    sort: '-date_published',
    items,
  };
}

function getPostDateValues(posts: PostMeta[]): string[] {
  return posts.flatMap((post) => [
    post.publishedAt.toISOString(),
    (post.updatedAt || post.publishedAt).toISOString(),
  ]);
}

function toPostItem(post: PostMeta): PublicPostItem {
  const canonicalUrl = getDocumentUrl('post', post.slug);
  const publishedAt = post.publishedAt.toISOString();
  const modifiedAt = (post.updatedAt || post.publishedAt).toISOString();

  return {
    slug: post.slug,
    title: post.title,
    description: post.description || `${post.title}についての記事です。`,
    canonical_url: canonicalUrl,
    date_published: publishedAt,
    date_modified: modifiedAt,
    category: {
      slug: getCategoryRouteSegment(post.category),
      label: getCategoryMeta(post.category).label,
    },
    tags: [...post.tags].sort(compareStrings),
    representations: createRepresentations(canonicalUrl),
  };
}

function toNoteItem(note: NoteMeta): PublicNoteItem {
  const canonicalUrl = getDocumentUrl('notes', note.slug);
  const publishedAt = note.publishedAt.toISOString();

  return {
    slug: note.slug,
    title: note.title,
    description: note.excerpt || `${note.title}の短文Noteです。`,
    canonical_url: canonicalUrl,
    date_published: publishedAt,
    date_modified: publishedAt,
    tags: [...note.tags].sort(compareStrings),
    representations: createRepresentations(canonicalUrl),
  };
}

function createRepresentations(canonicalUrl: string): PublicPostItem['representations'] {
  return {
    html: {
      url: canonicalUrl,
      media_type: 'text/html',
    },
    markdown: {
      url: canonicalUrl,
      media_type: 'text/markdown',
      request_headers: { Accept: 'text/markdown' },
    },
  };
}

function getDocumentUrl(route: 'post' | 'notes', slug: string): string {
  return `${SITE_BASE_URL}/${route}/${encodeRouteSegment(slug)}`;
}

function comparePostItems(left: PublicPostItem, right: PublicPostItem): number {
  return comparePublishedItems(left, right) || compareStrings(left.slug, right.slug);
}

function compareNoteItems(left: PublicNoteItem, right: PublicNoteItem): number {
  return comparePublishedItems(left, right) || compareStrings(left.slug, right.slug);
}

function comparePublishedItems(
  left: { date_published: string },
  right: { date_published: string },
): number {
  return (
    right.date_published < left.date_published ? -1
    : right.date_published > left.date_published ? 1
    : 0
  );
}

function compareStrings(left: string, right: string): number {
  return (
    left < right ? -1
    : left > right ? 1
    : 0
  );
}

function getContentModifiedAt(dates: string[]): string {
  return dates.reduce(
    (latest, date) => (date > latest ? date : latest),
    '1970-01-01T00:00:00.000Z',
  );
}
