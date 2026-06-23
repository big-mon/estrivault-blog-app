import { normalizeForSlug, normalizeForTagFilter } from '@estrivault/content-processor';

/**
 * @param {string} tag
 * @returns {string}
 */
export function getTagRouteSegment(tag) {
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

/**
 * @param {string} category
 * @returns {string}
 */
export function getCategoryRouteSegment(category) {
  const routeSegment = category.toLowerCase();
  if (!routeSegment.trim()) {
    throw new Error('Category route segment cannot be generated from an empty category.');
  }

  return routeSegment;
}

/**
 * @param {string} segment
 * @returns {string}
 */
export function encodeRouteSegment(segment) {
  return encodeURIComponent(segment);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function getSlugFromMarkdownPath(filePath) {
  const filename = filePath.split(/[\\/]/).pop();
  if (!filename) {
    return '';
  }

  return filename.replace(/\.(md|mdx)$/, '');
}

/**
 * @param {string} routeBase
 * @param {number} page
 * @returns {string}
 */
export function getArchivePagePath(routeBase, page) {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Archive page must be a positive integer: ${page}`);
  }

  const normalizedBase = routeBase === '/' ? '' : routeBase.replace(/\/+$/g, '');

  if (page === 1) {
    return `${normalizedBase}/`;
  }

  return `${normalizedBase}/${page}/`;
}

/**
 * @param {string} siteBase
 * @param {string} routeBase
 * @param {number} page
 * @returns {string}
 */
export function getArchivePageUrl(siteBase, routeBase, page) {
  return `${siteBase.replace(/\/$/, '')}${getArchivePagePath(routeBase, page)}`;
}
