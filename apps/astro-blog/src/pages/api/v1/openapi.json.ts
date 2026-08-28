import type { APIRoute } from 'astro';
import { getOpenApiDocument, jsonResponse } from '$lib/public-api';

export const prerender = true;

export const GET: APIRoute = () => jsonResponse(getOpenApiDocument());
