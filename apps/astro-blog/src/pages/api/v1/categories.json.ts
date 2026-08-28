import type { APIRoute } from 'astro';
import { getCategoriesCollection, jsonResponse } from '$lib/public-api';

export const prerender = true;

export const GET: APIRoute = async () => jsonResponse(await getCategoriesCollection());
