import type { APIRoute } from 'astro';
import satori from 'satori';
import sharp from 'sharp';
import { getOgSatoriFonts } from '../../lib/og-fonts';
import { buildContentMap } from '../../lib/content-map';
import { posterSVG } from '../../lib/map/contours';
import { MAP_UI } from '../../components/map/strings';

// Hex twins of the dark-theme tokens (the rasteriser doesn't parse oklch()).
const OG = { ink: '#e8eaf0', acc: '#86a7e8', warm: '#e9b45a', bg: '#0b0d12' };

/** The map's social card: the real terrain (dark) with the title and build-time counts. */
export async function renderMapOg(lang: 'en' | 'es'): Promise<Buffer> {
	const G = await buildContentMap(lang);
	const ui = MAP_UI[lang];
	const b = G.bounds.wide;
	// Frame the content bounds at 1200x630, shifted so the essays and ridge sit right of the copy.
	const w = b.x1 - b.x0;
	const h = (w * 630) / 1200;
	const terrain = posterSVG(G, 'wide', {
		palette: OG,
		unit: 2.6,
		viewBox: [b.x0 - w * 0.28, (b.y0 + b.y1) / 2 - h * 0.62, w * 1.28, h * 1.28],
		size: [1200, 630],
	});
	const base = await sharp(Buffer.from(terrain)).flatten({ background: OG.bg }).png().toBuffer();

	const s = G.stats;
	const counts = [
		`${s.posts} ${ui.legend.posts}`,
		`${s.modules} ${ui.legend.modules}`,
		`${s.lab} ${ui.legend.lab}`,
	].join('  ·  ');
	const text = await satori(
		{
			type: 'div',
			props: {
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					padding: '56px 64px',
					backgroundImage: 'linear-gradient(90deg, rgba(11,13,18,0.94) 0%, rgba(11,13,18,0.78) 42%, rgba(11,13,18,0) 72%)',
				},
				children: [
					{ type: 'div', props: { style: { fontFamily: 'Sans', fontSize: 18, letterSpacing: 4, color: OG.acc, marginBottom: 18 }, children: ui.eyebrow.toUpperCase() } },
					{ type: 'div', props: { style: { fontFamily: 'Serif', fontWeight: 700, fontSize: 54, lineHeight: 1.08, color: '#ffffff', maxWidth: 620, marginBottom: 26 }, children: ui.card.title } },
					{ type: 'div', props: { style: { fontFamily: 'Sans', fontSize: 19, color: '#a8b0c2', maxWidth: 640, lineHeight: 1.5 }, children: counts } },
					{ type: 'div', props: { style: { fontFamily: 'Sans', fontSize: 18, color: '#6f7890', marginTop: 30 }, children: lang === 'es' ? 'valdemird.com/es/map' : 'valdemird.com/map' } },
				],
			},
		} as any,
		{ width: 1200, height: 630, fonts: getOgSatoriFonts() },
	);
	const overlay = await sharp(Buffer.from(text)).png().toBuffer();
	return sharp(base).composite([{ input: overlay }]).png().toBuffer();
}

export const GET: APIRoute = async () =>
	new Response(new Uint8Array(await renderMapOg('en')), {
		headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
	});
