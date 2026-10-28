import type { APIRoute } from 'astro';
import { buildContentMap } from '../../lib/content-map';
import { posterSVG } from '../../lib/map/contours';

/** Static terrain poster, portrait layout (phones). Shared by /map/ and /es/map/. */
export const GET: APIRoute = async () =>
	new Response(posterSVG(await buildContentMap('en'), 'tall'), {
		headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
	});
