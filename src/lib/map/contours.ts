/**
 * Knowledge map, build time only: marching-squares contours over the height
 * field and the static poster SVG (the no-JS / no-GPU / pre-first-frame state).
 * Never imported by client code.
 */
import { CONTOUR_LEVELS, heightField, peaksFor, pos, type Layout, type MapGraph } from './terrain';

type Pt = [number, number];

/**
 * Closed iso-lines of `f` at `level`, in grid coordinates. The field is padded
 * with a zero border so every ring closes; saddles are resolved by the centre value.
 */
export function isolines(f: Float32Array, gw: number, gh: number, level: number): Pt[][] {
	const W = gw + 2;
	const H = gh + 2;
	const v = (x: number, y: number) => (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1 ? 0 : f[(y - 1) * gw + (x - 1)]);
	// Edge ids: horizontal edge (x,y)-(x+1,y) = 2*(y*W+x); vertical (x,y)-(x,y+1) = 2*(y*W+x)+1.
	const point = new Map<number, Pt>();
	const ptOn = (id: number): Pt => {
		let p = point.get(id);
		if (p) return p;
		const cell = id >> 1;
		const x = cell % W;
		const y = (cell - x) / W;
		const a = v(x, y);
		const b = id & 1 ? v(x, y + 1) : v(x + 1, y);
		const t = Math.abs(b - a) < 1e-9 ? 0.5 : (level - a) / (b - a);
		p = id & 1 ? [x - 1, y - 1 + t] : [x - 1 + t, y - 1];
		point.set(id, p);
		return p;
	};
	// Undirected adjacency: with the zero border every edge point has exactly two neighbours.
	const adj = new Map<number, number[]>();
	const link = (a: number, b: number) => {
		(adj.get(a) ?? adj.set(a, []).get(a)!).push(b);
		(adj.get(b) ?? adj.set(b, []).get(b)!).push(a);
	};
	for (let y = 0; y < H - 1; y++) {
		for (let x = 0; x < W - 1; x++) {
			const tl = v(x, y) > level ? 8 : 0;
			const tr = v(x + 1, y) > level ? 4 : 0;
			const br = v(x + 1, y + 1) > level ? 2 : 0;
			const bl = v(x, y + 1) > level ? 1 : 0;
			const c = tl | tr | br | bl;
			if (c === 0 || c === 15) continue;
			const top = 2 * (y * W + x);
			const bottom = 2 * ((y + 1) * W + x);
			const left = 2 * (y * W + x) + 1;
			const right = 2 * (y * W + x + 1) + 1;
			switch (c) {
				case 1: link(bottom, left); break;
				case 2: link(right, bottom); break;
				case 3: link(right, left); break;
				case 4: link(top, right); break;
				case 6: link(top, bottom); break;
				case 7: link(top, left); break;
				case 8: link(left, top); break;
				case 9: link(bottom, top); break;
				case 11: link(right, top); break;
				case 12: link(left, right); break;
				case 13: link(bottom, right); break;
				case 14: link(left, bottom); break;
				case 5: {
					const centre = (v(x, y) + v(x + 1, y) + v(x + 1, y + 1) + v(x, y + 1)) / 4 > level;
					if (centre) { link(bottom, right); link(top, left); } else { link(bottom, left); link(top, right); }
					break;
				}
				case 10: {
					const centre = (v(x, y) + v(x + 1, y) + v(x + 1, y + 1) + v(x, y + 1)) / 4 > level;
					if (centre) { link(left, bottom); link(right, top); } else { link(left, top); link(right, bottom); }
					break;
				}
			}
		}
	}
	const rings: Pt[][] = [];
	const seen = new Set<number>();
	for (const start of adj.keys()) {
		if (seen.has(start)) continue;
		const ring: Pt[] = [];
		let prev = -1;
		let id: number | undefined = start;
		while (id !== undefined && !seen.has(id)) {
			seen.add(id);
			ring.push(ptOn(id));
			const nb: number[] = adj.get(id) ?? [];
			const nxt: number | undefined = nb.find((n) => n !== prev && !seen.has(n));
			prev = id;
			id = nxt;
		}
		if (ring.length > 2) rings.push(ring);
	}
	return rings;
}

/** Radial-distance simplification: drop points closer than `tol` to the last kept one. */
function thin(ring: Pt[], tol: number): Pt[] {
	const out: Pt[] = [ring[0]];
	for (let i = 1; i < ring.length; i++) {
		const [ax, ay] = out[out.length - 1];
		if (Math.hypot(ring[i][0] - ax, ring[i][1] - ay) >= tol) out.push(ring[i]);
	}
	return out;
}

export interface ContourSet {
	level: number;
	index: boolean;
	d: string;
}

/** World-space contour paths for one layout: one evenodd path per level. */
export function contourPaths(graph: MapGraph, layout: Layout, gw = 240): ContourSet[] {
	const { w: W, h: H } = graph.world[layout];
	const hf = heightField(peaksFor(graph, layout), W, H, gw);
	const sx = W / hf.gw;
	const sy = H / hf.gh;
	const out: ContourSet[] = [];
	for (let l = 1; l < CONTOUR_LEVELS; l++) {
		const level = l / CONTOUR_LEVELS;
		const rings = isolines(hf.f, hf.gw, hf.gh, level);
		let d = '';
		for (const ring of rings) {
			const pts = thin(ring, 1.5);
			if (pts.length < 3) continue;
			d += `M${pts.map(([x, y]) => `${Math.round((x + 0.5) * sx)} ${Math.round((y + 0.5) * sy)}`).join('L')}Z`;
		}
		if (d) out.push({ level: l, index: l % 5 === 0, d });
	}
	return out;
}

/**
 * Theme palette for the standalone SVGs. They load as <img>, where the page's
 * CSS custom properties can't reach, so these mirror the global.css tokens
 * (--color-text, --color-accent, --color-warning-text, --color-bg) and switch
 * with the same prefers-color-scheme query the site theme follows.
 */
export const POSTER_PALETTE = {
	light: { ink: 'oklch(0.18 0.01 260)', acc: 'oklch(0.55 0.15 260)', warm: 'oklch(0.5 0.11 70)', bg: 'oklch(0.99 0 0)' },
	dark: { ink: 'oklch(0.93 0.005 260)', acc: 'oklch(0.7 0.12 260)', warm: 'oklch(0.8 0.13 75)', bg: 'oklch(0.16 0.01 260)' },
};

export interface PosterOptions {
	/** Force one theme (the OG card); default follows prefers-color-scheme. */
	theme?: 'light' | 'dark';
	/** World units per CSS px at the typical home framing, sizes the glyphs. */
	unit?: number;
	/** Explicit colours (the OG rasteriser doesn't parse oklch()). */
	palette?: (typeof POSTER_PALETTE)['light'];
	/** Crop the viewBox to these world bounds. */
	viewBox?: [number, number, number, number];
	/** Output size in px (defaults to world size). */
	size?: [number, number];
}

const style = (p: (typeof POSTER_PALETTE)['light']) => `
.c{fill:${p.acc};fill-opacity:.016;fill-rule:evenodd;stroke:${p.ink};stroke-opacity:.11;stroke-width:1;vector-effect:non-scaling-stroke}
.c.i{stroke-opacity:.2}
.e{fill:none;stroke-width:1;vector-effect:non-scaling-stroke}
.e-trail{stroke:${p.acc};stroke-opacity:.6;stroke-width:1.5;stroke-dasharray:3 5}
.e-cites{stroke:${p.acc};stroke-opacity:.3}
.e-links{stroke:${p.ink};stroke-opacity:.32}
.e-uses{stroke:${p.warm};stroke-opacity:.07}
.n-post{fill:${p.ink}}
.n-module{fill:${p.bg};stroke:${p.acc};stroke-width:2;vector-effect:non-scaling-stroke}
.n-lab{fill:${p.warm}}`;

/** The poster: terrain fill + contours + the structural edges + glyphs. No text (labels are HTML links). */
export function posterSVG(graph: MapGraph, layout: Layout, opts: PosterOptions = {}): string {
	const { w: W, h: H } = graph.world[layout];
	const u = opts.unit ?? (layout === 'tall' ? 3.6 : 1.75);
	const css = opts.palette
		? style(opts.palette)
		: opts.theme
		? style(POSTER_PALETTE[opts.theme])
		: `${style(POSTER_PALETTE.light)}\n@media (prefers-color-scheme: dark){${style(POSTER_PALETTE.dark)}}`;
	const sets = contourPaths(graph, layout, layout === 'tall' ? 130 : 240);
	const byId = new Map(graph.nodes.map((n) => [n.id, n]));
	const out: string[] = [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(opts.viewBox ?? [0, 0, W, H]).join(' ')}" width="${opts.size?.[0] ?? W}" height="${opts.size?.[1] ?? H}" preserveAspectRatio="xMidYMid slice">`,
		`<style>${css}</style>`,
	];
	for (const s of sets) out.push(`<path class="c${s.index ? ' i' : ''}" d="${s.d}"/>`);
	out.push('<g>');
	for (const e of graph.edges) {
		if (!['trail', 'cites', 'links', 'uses'].includes(e.k)) continue;
		const a = byId.get(e.s);
		const b = byId.get(e.t);
		if (!a || !b) continue;
		const [ax, ay] = pos(a, layout);
		const [bx, by] = pos(b, layout);
		const bend = e.k === 'trail' ? 0.06 : 0.14;
		const cx = (ax + bx) / 2 - (by - ay) * bend;
		const cy = (ay + by) / 2 + (bx - ax) * bend;
		out.push(`<path class="e e-${e.k}" d="M${Math.round(ax)} ${Math.round(ay)}Q${Math.round(cx)} ${Math.round(cy)} ${Math.round(bx)} ${Math.round(by)}"/>`);
	}
	out.push('</g><g>');
	for (const n of graph.nodes) {
		const [x, y] = pos(n, layout).map(Math.round);
		if (n.type === 'post') out.push(`<circle class="n-post" cx="${x}" cy="${y}" r="${(6.5 * u).toFixed(1)}"/>`);
		else if (n.type === 'module') out.push(`<circle class="n-module" cx="${x}" cy="${y}" r="${(5.2 * u).toFixed(1)}"/>`);
		else if (n.type === 'lab') {
			const r = (4.2 + Math.min(3, (n.usedBy ?? 0) * 0.5)) * u;
			out.push(`<rect class="n-lab" x="${(x - r / 1.41).toFixed(1)}" y="${(y - r / 1.41).toFixed(1)}" width="${(r * 1.41).toFixed(1)}" height="${(r * 1.41).toFixed(1)}" transform="rotate(45 ${x} ${y})"/>`);
		}
	}
	out.push('</g></svg>');
	return out.join('');
}
