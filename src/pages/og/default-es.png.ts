import type { APIRoute } from 'astro';
import { renderDefaultOg } from './default.png';

export const GET: APIRoute = async () => {
	const png = await renderDefaultOg('Ingeniero de software, maker y escritor.');
	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
