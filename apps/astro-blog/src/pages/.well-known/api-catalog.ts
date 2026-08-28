import type { APIRoute } from 'astro';
import { apiCatalogResponse } from '$lib/public-api';

export const prerender = true;

export const GET: APIRoute = () => apiCatalogResponse();
