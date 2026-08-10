import { getCategoryMeta, POSTS_PER_PAGE, SITE_TITLE, SITE_URL } from '$constants';
import { getAllNotesMeta, getAllPostsMeta, getPaginatedPosts } from '$lib/content';
import {
  encodeRouteSegment,
  getArchivePageUrl,
  getCategoryRouteSegment,
  getTagRouteSegment,
} from '$lib/url-segments.mjs';

export type PublicDiscoverySection =
  'core' | 'posts' | 'notes' | 'categories' | 'tags' | 'pagination';

export interface PublicDiscoveryEntry {
  section: PublicDiscoverySection;
  url: string;
  title: string;
  description?: string;
  publishedAt?: Date;
  lastmod?: Date;
  changefreq: 'daily' | 'weekly';
  priority: 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;
}

function getDocumentUrl(siteBase: string, route: 'post' | 'notes', slug: string): string {
  return `${siteBase}/${route}/${encodeRouteSegment(slug)}`;
}

export async function getPublicDiscoveryInventory(): Promise<PublicDiscoveryEntry[]> {
  const siteBase = SITE_URL.replace(/\/$/, '');
  const posts = await getAllPostsMeta();
  const notes = await getAllNotesMeta();
  const entries: PublicDiscoveryEntry[] = [
    {
      section: 'core',
      url: SITE_URL,
      title: SITE_TITLE,
      description: 'Site home and latest public content.',
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      section: 'core',
      url: `${siteBase}/llms.txt`,
      title: 'LLM discovery guide',
      description: 'Short guide to the site, canonical representations, and public route families.',
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      section: 'core',
      url: `${siteBase}/sitemap.md`,
      title: 'Markdown sitemap',
      description: 'Human- and agent-readable inventory of canonical public resources.',
      changefreq: 'daily',
      priority: 0.7,
    },
    {
      section: 'core',
      url: getArchivePageUrl(siteBase, '/notes', 1),
      title: 'Notes',
      description: 'Short-form notes and independent mini-articles.',
      changefreq: 'weekly',
      priority: 0.7,
    },
  ];

  const indexTotalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  for (let page = 2; page <= indexTotalPages; page++) {
    entries.push({
      section: 'pagination',
      url: getArchivePageUrl(siteBase, '/', page),
      title: `Article archive, page ${page}`,
      changefreq: 'daily',
      priority: 0.7,
    });
  }

  for (const post of posts) {
    entries.push({
      section: 'posts',
      url: getDocumentUrl(siteBase, 'post', post.slug),
      title: post.title,
      description: post.description,
      publishedAt: post.publishedAt,
      lastmod: post.updatedAt || post.publishedAt,
      changefreq: 'weekly',
      priority: 0.8,
    });
  }

  for (const note of notes) {
    entries.push({
      section: 'notes',
      url: getDocumentUrl(siteBase, 'notes', note.slug),
      title: note.title,
      description: note.excerpt,
      publishedAt: note.publishedAt,
      lastmod: note.publishedAt,
      changefreq: 'weekly',
      priority: 0.6,
    });
  }

  const categories = [...new Set(posts.map((post) => post.category))].sort((a, b) =>
    a.localeCompare(b),
  );
  for (const category of categories) {
    const categoryMeta = getCategoryMeta(category);
    const categoryPosts = getPaginatedPosts(posts, { category, perPage: POSTS_PER_PAGE });
    const routeBase = `/category/${encodeRouteSegment(getCategoryRouteSegment(category))}`;

    for (let page = 1; page <= categoryPosts.totalPages; page++) {
      entries.push({
        section: page === 1 ? 'categories' : 'pagination',
        url: getArchivePageUrl(siteBase, routeBase, page),
        title:
          page === 1 ?
            `${categoryMeta.label} category`
          : `${categoryMeta.label} category, page ${page}`,
        description: page === 1 ? categoryMeta.description : undefined,
        changefreq: 'weekly',
        priority: 0.6,
      });
    }
  }

  const tags = [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));
  for (const tag of tags) {
    const tagPosts = getPaginatedPosts(posts, { tag, perPage: POSTS_PER_PAGE });
    const routeBase = `/tag/${encodeRouteSegment(getTagRouteSegment(tag))}`;

    for (let page = 1; page <= tagPosts.totalPages; page++) {
      entries.push({
        section: page === 1 ? 'tags' : 'pagination',
        url: getArchivePageUrl(siteBase, routeBase, page),
        title: page === 1 ? `#${tag}` : `#${tag}, page ${page}`,
        changefreq: 'weekly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
