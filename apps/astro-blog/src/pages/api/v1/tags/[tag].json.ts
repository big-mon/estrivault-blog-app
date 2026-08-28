import type { APIRoute } from 'astro';
import { getTagDetail, getTagsCollection, jsonResponse } from '$lib/public-api';

export const prerender = true;

export async function getStaticPaths() {
  const tags = await getTagsCollection();
  return tags.items.map((tag) => ({ params: { tag: tag.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.tag;
  if (!slug) {
    return new Response('Missing tag slug', { status: 400 });
  }

  const detail = await getTagDetail(slug);
  return detail ? jsonResponse(detail) : new Response('Not found', { status: 404 });
};
