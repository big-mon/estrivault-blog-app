import type { APIRoute } from 'astro';
import { getApiIndex, jsonResponse } from '$lib/public-api';

export const prerender = true;

export const GET: APIRoute = async () => jsonResponse(await getApiIndex());
