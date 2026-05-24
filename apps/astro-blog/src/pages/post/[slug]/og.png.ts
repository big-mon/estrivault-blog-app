import type { APIRoute } from 'astro';
import path from 'node:path';
import { generatePostOgpPng } from '@estrivault/og-image-generator';
import { getCategoryLabel, SITE_TITLE, SITE_URL } from '$constants';
import { getAllPostsMeta } from '$lib/content';

const ogpCacheDir = path.join(process.cwd(), 'node_modules', '.astro', 'og-image-cache');

export async function getStaticPaths() {
  const allPosts = await getAllPostsMeta();
  return allPosts.map((post) => ({ params: { slug: post.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const post = (await getAllPostsMeta()).find((postMeta) => postMeta.slug === slug);
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const png = await generatePostOgpPng(
    {
      title: post.title,
      category: getCategoryLabel(post.category || 'meta'),
      publishedAt: post.publishedAt,
      slug: post.slug,
      siteTitle: SITE_TITLE,
      siteUrl: SITE_URL,
    },
    { cacheDir: ogpCacheDir },
  );

  const body = new Uint8Array(png).buffer;

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
