import type { APIRoute } from 'astro';
import { POSTS_PER_PAGE } from '$constants';
import { getAllPostsMeta, getPosts } from '$lib/content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const indexPages = await getPosts({ perPage: POSTS_PER_PAGE });
  const posts = await getAllPostsMeta();
  const pageRedirects: string[] = ['/1 / 301', '/1/ / 301'];
  const postRedirects = posts.map((post) => {
    const encodedSlug = encodeURIComponent(post.slug);
    return `/post/${encodedSlug}/ /post/${encodedSlug} 301`;
  });

  for (let page = 2; page <= indexPages.totalPages; page++) {
    pageRedirects.push(`/${page} /${page}/ 301`);
  }

  const redirects = [
    '# Canonical URL redirects',
    '',
    '# The first archive page omits its page number.',
    ...pageRedirects,
    '/category/:category/1 /category/:category/ 301',
    '/category/:category/1/ /category/:category/ 301',
    '/tag/:tag/1 /tag/:tag/ 301',
    '/tag/:tag/1/ /tag/:tag/ 301',
    '',
    '# Archive pages are collection resources and keep a trailing slash.',
    '/category/:category /category/:category/ 301',
    '/category/:category/:page /category/:category/:page/ 301',
    '/tag/:tag /tag/:tag/ 301',
    '/tag/:tag/:page /tag/:tag/:page/ 301',
    '',
    '# Article pages are document resources and omit a trailing slash.',
    ...postRedirects,
  ];

  return new Response(`${redirects.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
