import { normalizeForSlug, normalizeForTagFilter } from '@estrivault/content-processor';

function encodePathDelimiters(segment: string): string {
  return segment.replace(/[/%?#\\]/g, (char) => encodeURIComponent(char));
}

export function getTagRouteSegment(tag: string): string {
  const cleaned = tag.trim();
  if (!cleaned) {
    throw new Error('Tag route segment cannot be generated from an empty tag.');
  }

  const normalizedSlug = normalizeForSlug(cleaned);
  if (normalizedSlug) {
    return normalizedSlug;
  }

  return encodePathDelimiters(normalizeForTagFilter(cleaned).replace(/\s+/g, '-'));
}
