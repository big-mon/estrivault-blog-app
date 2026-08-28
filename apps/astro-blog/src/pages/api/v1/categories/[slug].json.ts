import type { APIRoute } from 'astro';
import { getCategoriesCollection, getCategoryDetail, jsonResponse } from '$lib/public-api';

export const prerender = true;

export async function getStaticPaths() {
  const categories = await getCategoriesCollection();
  return categories.items.map((category) => ({ params: { slug: category.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response('Missing category slug', { status: 400 });
  }

  const detail = await getCategoryDetail(slug);
  return detail ? jsonResponse(detail) : new Response('Not found', { status: 404 });
};
