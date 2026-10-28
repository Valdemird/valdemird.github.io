/**
 * Knowledge map: shared, dependency-free math for the terrain.
 *
 * Imported both at build time (content-map.ts, the poster SVGs, the OG card)
 * and by the client engine, so the no-JS poster and the GPU render come from
 * the exact same height field and the exact same framing rule.
 */

export type NodeType = 'post' | 'module' | 'lab' | 'term' | 'tag';
export type EdgeKind = 'trail' | 'cites' | 'uses' | 'links' | 'tag' | 'term' | 'term2' | 'uses-m';
export type Layout = 'wide' | 'tall';

export interface MapNode {
	id: string;
	type: NodeType;
	slug: string;
	/** Full title in the page language. */
	title: string;
	/** Short place name used on the map itself. */
	short: string;
	desc?: string;
	href?: string;
	date?: string;
	minutes?: number;
	words?: number;
	order?: number;
	phase?: number;
	sources?: number;
	grades?: Record<'A' | 'B' | 'C' | 'D', number>;
	category?: string;
	status?: string;
	usedBy?: number;
	count?: number;
	keyword?: boolean;
	modules?: string[];
	/** Position in the wide (landscape) and tall (portrait) layouts, world units. */
	x: number;
	y: number;
	px: number;
	py: number;
	/** Peak height (normalised words) and spread, for the height field. */
	h: number;
	s: number;
}

export interface MapEdge {
	s: string;
	t: string;
	k: EdgeKind;
}

export interface MapMark {
	key: string;
	label: string;
	/** a one-word name for narrow plates (lab shelves) */
	short?: string;
	eyebrow?: string;
	count?: number;
	x: number;
	y: number;
	px: number;
	py: number;
}

export interface MapIsland {
	x: number;
	y: number;
	px: number;
	py: number;
	h: number;
	s: number;
}

export interface Bounds {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

export interface MapStats {
	posts: number;
	modules: number;
	lab: number;
	terms: number;
	tags: number;
	phases: number;
	categories: number;
	edges: number;
	sources: number;
	wordsPosts: number;
	wordsCourse: number;
	firstPost: string;
	lastPost: string;
}

export interface MapGraph {
	lang: 'en' | 'es';
	world: { wide: { w: number; h: number }; tall: { w: number; h: number } };
	/** Home framing: the content bounds the camera fits on load, per layout. */
	bounds: { wide: Bounds; tall: Bounds };
	stats: MapStats;
	nodes: MapNode[];
	edges: MapEdge[];
	phases: MapMark[];
	categories: MapMark[];
	regions: { key: 'writing' | 'course' | 'lab'; label: string; y: number; py: number }[];
	islands: MapIsland[];
}

/** Below this plate aspect (w/h) the tall layout is used. Mirrored by a container query in MapPage. */
export const TALL_BELOW = 0.8;

export const pos = (n: { x: number; y: number; px: number; py: number }, layout: Layout) =>
	layout === 'tall' ? [n.px, n.py] : [n.x, n.y];

/** A peak list [x, y, height, sigma] for one layout. Heights are normalised later. */
export function peaksFor(graph: MapGraph, layout: Layout): number[][] {
	const out: number[][] = [];
	for (const n of graph.nodes) {
		if (n.type === 'tag' || !n.h) continue;
		const [x, y] = pos(n, layout);
		out.push([x, y, n.h, layout === 'tall' ? n.s * 0.82 : n.s]);
	}
	for (const i of graph.islands) {
		const [x, y] = pos(i, layout);
		out.push([x, y, i.h, layout === 'tall' ? i.s * 0.8 : i.s]);
	}
	return out;
}

export interface HeightField {
	f: Float32Array;
	gw: number;
	gh: number;
}

/** Sum of Gaussian bumps on a gw-wide grid covering the world, culled at 3σ, normalised to [0, 1]. */
export function heightField(peaks: number[][], W: number, H: number, gw: number): HeightField {
	const gh = Math.max(2, Math.round((gw * H) / W));
	const f = new Float32Array(gw * gh);
	const cx = gw / W;
	const cy = gh / H;
	for (const [px, py, a, s] of peaks) {
		const r = 3 * s;
		const inv = 1 / (2 * s * s);
		const x0 = Math.max(0, Math.floor((px - r) * cx));
		const x1 = Math.min(gw - 1, Math.ceil((px + r) * cx));
		const y0 = Math.max(0, Math.floor((py - r) * cy));
		const y1 = Math.min(gh - 1, Math.ceil((py + r) * cy));
		for (let gy = y0; gy <= y1; gy++) {
			const dy = (gy + 0.5) / cy - py;
			const ey = dy * dy;
			for (let gx = x0; gx <= x1; gx++) {
				const dx = (gx + 0.5) / cx - px;
				f[gy * gw + gx] += a * Math.exp(-(dx * dx + ey) * inv);
			}
		}
	}
	let m = 0;
	for (let i = 0; i < f.length; i++) if (f[i] > m) m = f[i];
	if (m > 0) for (let i = 0; i < f.length; i++) f[i] /= m;
	return { f, gw, gh };
}

/** Number of contour levels drawn over the [0, 1] field (every 5th is an index contour). */
export const CONTOUR_LEVELS = 14;

/**
 * The home framing scale: px per world unit so the content bounds fit the plate.
 * CSS mirrors this with `min(100cqw / bw, 100cqh / bh)`.
 */
export function fitScale(b: Bounds, vw: number, vh: number): number {
	return Math.min(vw / (b.x1 - b.x0), vh / (b.y1 - b.y0));
}
