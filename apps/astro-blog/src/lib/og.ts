import { SITE_URL } from '$constants';

export function getPostOgpImageUrl(slug: string): string {
  const siteBase = SITE_URL.replace(/\/$/, '');
  return `${siteBase}/post/${encodeURIComponent(slug)}/og.png`;
}
