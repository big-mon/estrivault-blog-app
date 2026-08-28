import type { APIRoute } from 'astro';
import { getPostsCollection, jsonResponse } from '$lib/public-api';

export const prerender = true;

export const GET: APIRoute = async () => jsonResponse(await getPostsCollection());
