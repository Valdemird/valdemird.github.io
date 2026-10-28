import type { APIRoute } from 'astro';
import { buildContentMap } from '../../../lib/content-map';

/** The knowledge map's build-time graph (ES). Fetched by the /es/map/ engine; also a public, static data file. */
export const GET: APIRoute = async () =>
	new Response(JSON.stringify(await buildContentMap('es')), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
