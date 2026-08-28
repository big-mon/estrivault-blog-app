import type { APIRoute } from 'astro';
import { getNotesCollection, jsonResponse } from '$lib/public-api';

export const prerender = true;

export const GET: APIRoute = async () => jsonResponse(await getNotesCollection());
