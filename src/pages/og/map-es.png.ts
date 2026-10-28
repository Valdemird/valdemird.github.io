import type { APIRoute } from 'astro';
import { renderMapOg } from './map.png';

export const GET: APIRoute = async () =>
	new Response(new Uint8Array(await renderMapOg('es')), {
		headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
	});
