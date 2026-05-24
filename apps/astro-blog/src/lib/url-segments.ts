import { normalizeForSlug, normalizeForTagFilter } from '@estrivault/content-processor';

export function getTagRouteSegment(tag: string): string {
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

export function encodeRouteSegment(segment: string): string {
  return encodeURIComponent(segment);
}
