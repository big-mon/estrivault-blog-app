import { normalizeForSlug, normalizeForTagFilter } from '@estrivault/content-processor';

export function getTagRouteSegment(tag: string): string {
  const normalizedSlug = normalizeForSlug(tag);
  if (normalizedSlug) {
    return normalizedSlug;
  }

  return encodeURIComponent(normalizeForTagFilter(tag).replace(/\s+/g, '-'));
}
