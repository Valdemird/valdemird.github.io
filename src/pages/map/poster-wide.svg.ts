import type { APIRoute } from 'astro';
import { buildContentMap } from '../../lib/content-map';
import { posterSVG } from '../../lib/map/contours';

/** Static terrain poster, landscape layout. Shared by /map/ and /es/map/ (it carries no text). */
export const GET: APIRoute = async () =>
	new Response(posterSVG(await buildContentMap('en'), 'wide'), {
		headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
	});
