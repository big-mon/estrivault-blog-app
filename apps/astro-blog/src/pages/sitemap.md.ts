import type { APIRoute } from 'astro';
import {
  getPublicDiscoveryInventory,
  type PublicDiscoveryEntry,
  type PublicDiscoverySection,
} from '$lib/public-discovery';

export const prerender = true;

const sections: Array<{ key: PublicDiscoverySection; heading: string }> = [
  { key: 'core', heading: 'Core and discovery' },
  { key: 'posts', heading: 'Posts' },
  { key: 'notes', heading: 'Notes' },
  { key: 'categories', heading: 'Categories' },
  { key: 'tags', heading: 'Tags' },
  { key: 'pagination', heading: 'Pagination' },
];

function escapeMarkdownText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/([`*_[\]<>~&])/g, '\\$1')
    .trim();
}

function renderEntry(entry: PublicDiscoveryEntry): string {
  const metadata = [
    entry.publishedAt?.toISOString().slice(0, 10),
    entry.description && escapeMarkdownText(entry.description),
  ].filter(Boolean);

  return `- [${escapeMarkdownText(entry.title)}](<${entry.url}>)${metadata.length > 0 ? ` — ${metadata.join(' — ')}` : ''}`;
}

export const GET: APIRoute = async () => {
  const entries = await getPublicDiscoveryInventory();
  const groups = sections
    .map(({ key, heading }) => {
      const groupEntries = entries.filter((entry) => entry.section === key);
      return groupEntries.length > 0 ?
          `## ${heading}\n\n${groupEntries.map(renderEntry).join('\n')}`
        : '';
    })
    .filter(Boolean);
  const body = `# Estrilda public sitemap

Canonical public resources, grouped for discovery. Dates use ISO 8601.

${groups.join('\n\n')}`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'max-age=0, s-max-age=3600',
    },
  });
};
