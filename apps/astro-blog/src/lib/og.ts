import { SITE_URL } from '$constants';
import { AUTHOR_AVATAR_VERSION } from './author-avatar';

export function getPostOgpImageUrl(slug: string): string {
  const siteBase = SITE_URL.replace(/\/$/, '');
  return `${siteBase}/post/${encodeURIComponent(slug)}/og.png?v=4-${AUTHOR_AVATAR_VERSION}`;
}
