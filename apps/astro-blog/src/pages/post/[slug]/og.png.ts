import type { APIRoute } from 'astro';
import { generatePostOgpPng } from '@estrivault/og-image-generator';
import { SITE_TITLE, SITE_URL } from '$constants';
import { getAllPostsMeta, getPostBySlug } from '$lib/content';

export async function getStaticPaths() {
  const allPosts = await getAllPostsMeta();
  return allPosts.map((post) => ({ params: { slug: post.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const png = await generatePostOgpPng({
    title: post.meta.title,
    category: post.meta.category || 'Other',
    publishedAt: post.meta.publishedAt,
    slug: post.meta.slug,
    siteTitle: SITE_TITLE,
    siteUrl: SITE_URL,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
