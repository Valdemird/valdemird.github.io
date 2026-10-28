/**
 * Knowledge map engine (client). Loaded only on /map/ and /es/map/.
 *
 * The page is complete without this file: the poster image and every label
 * are server-rendered links, and the index below the plate lists the same
 * graph. This module only:
 *   - positions the labels (semantic zoom + greedy collision),
 *   - draws the terrain/edges/nodes on the GPU behind them once a first frame
 *     has been verified (WebGPU -> WebGL2 -> the poster, re-framed as SVG),
 *   - adds selection, the info card, search, keyboard and full screen.
 * mountMap() returns a teardown for astro:before-swap.
 */
import { navigate } from 'astro:transitions/client';
import { CONTOUR_LEVELS, fitScale, heightField, peaksFor, TALL_BELOW, type Layout, type MapGraph, type MapNode } from './terrain';
import { EDGE_STRIDE, NODE_STRIDE, initWebGL2, initWebGPU, verifyFrame, type Renderer, type SceneData } from './gpu';
import { tokenColor } from './color';

type Strings = Record<string, string>;

interface Adj {
	n: N;
	k: string;
	e: E;
	dir: 'in' | 'out';
}
interface N extends MapNode {
	i: number;
	wx: number;
	wy: number;
	adj: Adj[];
	L?: Label;
}
interface E {
	i: number;
	k: string;
	a: N;
	b: N;
}
interface Label {
	n?: N;
	el: HTMLElement;
	kind: string;
	mk?: { x: number; y: number; px: number; py: number };
	wx: number;
	wy: number;
	minTier: number;
	base: number;
	prio: number;
	/** shown even when its tier is hidden (the selection and its neighbours) */
	forced: boolean;
	/** never culled by a collision (the selected / hovered place itself) */
	must: boolean;
	off: boolean;
	/** label box relative to its anchor, for the default placement */
	bx: number;
	by: number;
	bw: number;
	bh: number;
	/** placements to try, in order ([dx, dy] of the box); index = SIDES class */
	cands: number[][];
	side: number;
	/** essays only: horizontal nudge (px) that keeps a title clear of the plate edges and the gutter */
	nx: number;
	/** last translate applied to the anchor (screen px) */
	sx: number;
	sy: number;
}
interface Cam {
	x: number;
	y: number;
	k: number;
}

const KIND: Record<string, number> = { trail: 0, cites: 1, uses: 2, links: 3, tag: 4, term: 5, term2: 6, 'uses-m': 7 };
const NKIND: Record<string, number> = { post: 0, module: 1, lab: 2, term: 3 };
const RETURN_KEY = 'km-return';
const SEEN_KEY = 'km-seen';

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const smooth = (x: number) => x * x * (3 - 2 * x);
const esc = (s: unknown) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Van Wijk & Nuij smooth zoom-and-pan path between two views [cx, cy, width]. */
function zoomPath(p0: number[], p1: number[]) {
	const rho = Math.SQRT2;
	const [ux0, uy0, w0] = p0;
	const [ux1, uy1, w1] = p1;
	const dx = ux1 - ux0;
	const dy = uy1 - uy0;
	const d2 = dx * dx + dy * dy;
	let S: number;
	let f: (s: number) => number[];
	if (d2 < 1e-6) {
		S = Math.log(w1 / w0) / rho;
		f = (s) => [ux0 + s * dx, uy0 + s * dy, w0 * Math.exp(rho * s * S)];
	} else {
		const d1 = Math.sqrt(d2);
		const b0 = (w1 * w1 - w0 * w0 + 4 * d2) / (2 * w0 * 2 * d1);
		const b1 = (w1 * w1 - w0 * w0 - 4 * d2) / (2 * w1 * 2 * d1);
		const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
		const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
		S = (r1 - r0) / rho;
		f = (s) => {
			const u = s * S;
			const c0 = Math.cosh(r0);
			const v = (w0 / (2 * d1)) * (c0 * Math.tanh(rho * u + r0) - Math.sinh(r0));
			return [ux0 + v * dx, uy0 + v * dy, (w0 * c0) / Math.cosh(rho * u + r0)];
		};
	}
	return { f, duration: Math.abs(S) * 1000 };
}

export function mountMap(root: HTMLElement): () => void {
	const ac = new AbortController();
	const signal = ac.signal;
	let dead = false;
	let raf = 0;
	let renderer: Renderer | null = null;
	const cleanups: (() => void)[] = [];

	const destroy = () => {
		dead = true;
		ac.abort();
		cancelAnimationFrame(raf);
		renderer?.destroy();
		renderer = null;
		for (const c of cleanups) c();
	};

	boot().catch((err) => {
		// Fail open: the poster and the labels are already a complete, linked map.
		console.warn('[map] staying on the static poster:', err);
		root.dataset.kmState = 'static';
	});
	return destroy;

	async function boot() {
		const S: Strings = JSON.parse(root.dataset.strings || '{}');
		const t = (k: string) => S[k] ?? k;
		const plate = root.querySelector<HTMLElement>('.km-plate')!;
		const labelsEl = root.querySelector<HTMLElement>('.km-labels')!;
		const posterImg = root.querySelector<HTMLImageElement>('.km-poster img');
		const cardEl = root.querySelector<HTMLElement>('.km-card')!;
		const readoutEl = root.querySelector<HTMLElement>('.km-readout');
		const hintEl = root.querySelector<HTMLElement>('.km-toast');
		const liveEl = root.querySelector<HTMLElement>('.km-live');
		const q = root.querySelector<HTMLInputElement>('.km-search input')!;
		const results = root.querySelector<HTMLUListElement>('.km-results')!;
		const fsBtn = root.querySelector<HTMLButtonElement>('[data-zoom="fs"]');
		const params = new URLSearchParams(location.search);
		const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
		const tallMQ = matchMedia(`(max-aspect-ratio: ${Math.round(TALL_BELOW * 100)}/100)`);
		const coarse = matchMedia('(pointer: coarse)').matches;
		let reduced = reducedMQ.matches;

		const res = await fetch(root.dataset.graph!, { signal });
		if (!res.ok) throw new Error(`graph ${res.status}`);
		const G: MapGraph = await res.json();
		if (dead) return;
		// Boot runs in a few short tasks, not one long one, so a tap during boot isn't kept waiting.
		const yieldTask = () => ((globalThis as any).scheduler?.yield?.() as Promise<void> | undefined) ?? new Promise<void>((r) => setTimeout(r, 0));

		/* -------------------------------------------------------------- graph */
		const nodes: N[] = G.nodes.map((n, i) => ({ ...n, i, wx: n.x, wy: n.y, adj: [] }));
		const byId = new Map(nodes.map((n) => [n.id, n]));
		const edges: E[] = G.edges
			.map((e) => ({ k: e.k, a: byId.get(e.s)!, b: byId.get(e.t)! }))
			.filter((e) => e.a && e.b)
			.map((e, i) => ({ ...e, i }));
		for (const e of edges) {
			e.a.adj.push({ n: e.b, k: e.k, e, dir: 'out' });
			e.b.adj.push({ n: e.a, k: e.k, e, dir: 'in' });
		}
		const drawNodes = nodes.filter((n) => n.type in NKIND);
		/** term id -> the module that owns it (its 'term' edge) */
		const primaryOf = new Map(edges.filter((e) => e.k === 'term').map((e) => [e.b.id, e.a.id]));

		/* -------------------------------------------------------------- labels (server-rendered links) */
		const labels: Label[] = [];
		for (const el of labelsEl.querySelectorAll<HTMLElement>('.nd')) {
			const n = byId.get(el.dataset.id!);
			if (!n) continue;
			const L: Label = {
				n,
				el,
				kind: n.type,
				wx: 0,
				wy: 0,
				minTier: { post: 0, module: 0, lab: 1, tag: 1, term: 2 }[n.type],
				base: { post: 800, module: 600, lab: 500 + (n.usedBy ?? 0) * 10, tag: 300, term: 200 }[n.type],
				prio: 0,
				forced: false,
				must: false,
				off: false,
				bx: 0,
				by: 0,
				bw: 0,
				bh: 0,
				cands: [],
				side: 0,
				nx: 0,
				sx: 0,
				sy: 0,
			};
			n.L = L;
			labels.push(L);
		}
		for (const el of labelsEl.querySelectorAll<HTMLElement>('.mk')) {
			const [kind, key] = el.dataset.mk!.split(':');
			const mk = (kind === 'phase' ? G.phases : G.categories).find((m) => m.key === key);
			if (!mk) continue;
			labels.push({ el, kind, mk, wx: 0, wy: 0, minTier: 0, base: kind === 'cat' ? 700 : 650, prio: 0, forced: false, must: false, off: false, bx: 0, by: 0, bw: 0, bh: 0, cands: [], side: 0, nx: 0, sx: 0, sy: 0 });
		}
		for (const L of labels) L.prio = L.base;
		let labelOrder = [...labels].sort((a, b) => b.prio - a.prio);

		/* -------------------------------------------------------------- layout + camera */
		let layout: Layout = tallMQ.matches ? 'tall' : 'wide';
		let W = 1;
		let H = 1;
		let vw = 1;
		let vh = 1;
		let dpr = 1;
		const cam: Cam = { x: 0, y: 0, k: 1 };
		let home: Cam = { x: 0, y: 0, k: 1 };
		const applyLayout = () => {
			W = G.world[layout].w;
			H = G.world[layout].h;
			for (const n of nodes) {
				n.wx = layout === 'tall' ? n.px : n.x;
				n.wy = layout === 'tall' ? n.py : n.y;
			}
			for (const L of labels) {
				const src = L.n ?? L.mk!;
				L.wx = layout === 'tall' ? src.px : src.x;
				L.wy = layout === 'tall' ? src.py : src.y;
			}
		};
		applyLayout();
		const computeHome = () => {
			const b = G.bounds[layout];
			home = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, k: fitScale(b, vw, vh) };
		};
		const kMin = () => home.k * 0.85;
		const kMax = () => Math.max(home.k * 9, 3.2);
		// Screen px the open card takes from the right edge (or the phone sheet from the bottom):
		// the camera may travel that much further so a place at the edge can sit beside the card.
		const slack = { x: 0, y: 0 };
		const clampCam = (c: Cam) => {
			c.k = Math.min(kMax(), Math.max(kMin(), c.k));
			const b = G.bounds[layout];
			const mx = (vw / 2 / c.k) * 0.6;
			const my = (vh / 2 / c.k) * 0.6;
			c.x = Math.min(b.x1 + mx + slack.x / c.k, Math.max(b.x0 - mx, c.x));
			c.y = Math.min(b.y1 + my + slack.y / c.k, Math.max(b.y0 - my, c.y));
			return c;
		};
		const w2s = (x: number, y: number) => [(x - cam.x) * cam.k + vw / 2, (y - cam.y) * cam.k + vh / 2];
		const s2w = (sx: number, sy: number) => [(sx - vw / 2) / cam.k + cam.x, (sy - vh / 2) / cam.k + cam.y];

		let flight: { f: (s: number) => number[]; t0: number; dur: number; ease: (x: number) => number; resolve: () => void } | null = null;
		const flyTo = (target: Cam, opts: { duration?: number; ease?: (x: number) => number; instant?: boolean } = {}) => {
			const to = clampCam({ ...target });
			if (reduced || opts.instant) {
				Object.assign(cam, to);
				flight?.resolve();
				flight = null;
				invalidate();
				return Promise.resolve();
			}
			const path = zoomPath([cam.x, cam.y, vw / cam.k], [to.x, to.y, vw / to.k]);
			const dur = opts.duration ?? Math.min(1400, Math.max(420, path.duration * 0.62));
			flight?.resolve();
			return new Promise<void>((resolve) => {
				flight = { f: path.f, t0: performance.now(), dur, ease: opts.ease ?? easeInOut, resolve };
				invalidate();
			});
		};

		/* -------------------------------------------------------------- selection state */
		let selId: string | null = null;
		let hoverId: string | null = null;
		const nState = nodes.map(() => ({ e: 0, v: 1, te: 0, tv: 1 }));
		const eState = edges.map(() => ({ e: 0, v: 1, te: 0, tv: 1 }));
		let flowUntil = 0;
		let lit = new Set<number>();
		const recomputeTargets = () => {
			const active = [selId, hoverId].filter(Boolean).map((id) => byId.get(id!)!);
			const near = new Set<string>();
			lit = new Set<number>();
			for (const n of active) {
				for (const a of n.adj) {
					if (a.k === 'term2' && n.type !== 'term') continue;
					if (a.k === 'tag' && n.type === 'post') continue;
					if (a.k === 'uses-m' && n.type === 'module') continue;
					if (a.k === 'uses-m' && n.type === 'lab' && (n.usedBy ?? 0) > 3) continue;
					near.add(a.n.id);
					lit.add(a.e.i);
				}
			}
			const any = active.length > 0;
			nodes.forEach((n, i) => {
				const s = nState[i];
				const on = active.includes(n);
				s.te = on ? 1 : near.has(n.id) ? 0.55 : 0;
				s.tv = any ? (on || near.has(n.id) ? 1 : 0.22) : 1;
			});
			edges.forEach((_e, i) => {
				eState[i].te = lit.has(i) ? 1 : 0;
				eState[i].tv = any ? (lit.has(i) ? 1 : 0.2) : 1;
			});
			labelsEl.classList.toggle('has-focus', any);
			const sel = selId ? byId.get(selId) : null;
			for (const L of labels) {
				if (!L.n) {
					L.prio = L.base;
					continue;
				}
				const id = L.n.id;
				L.el.classList.toggle('sel', id === selId);
				L.el.classList.toggle('hot', near.has(id) || id === hoverId);
				// a module's own terms outrank the ones it merely mentions; widely used terms outrank niche ones
				const termW = L.n.type === 'term' ? (primaryOf.get(id) === selId ? 30 : 0) + Math.min(20, (L.n.modules?.length ?? 0) * 3) : 0;
				L.prio = id === selId ? 2000 : id === hoverId ? 1900 : near.has(id) ? 1500 + L.base / 10 + termW : L.base;
				L.must = id === selId || id === hoverId;
				// neighbours show past their tier, but still go through the collision pass (terms that lose stay dots)
				L.forced = L.must || (!!sel && near.has(id) && (L.n.type !== 'term' || sel.type === 'term' || sel.type === 'module'));
			}
			labelOrder = [...labels].sort((a, b) => b.prio - a.prio);
			flowUntil = performance.now() + 4500;
			if (svgMode) drawHighlights();
			invalidate();
		};

		/* -------------------------------------------------------------- colours */
		const probe = document.createElement('i');
		probe.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none';
		plate.append(probe);
		cleanups.push(() => probe.remove());
		let colors: Record<string, number[]> = {};
		const isDark = () => document.documentElement.dataset.theme === 'dark';
		const readColors = () => {
			colors = {
				ink: tokenColor(probe, '--km-ink'),
				acc: tokenColor(probe, '--km-acc'),
				warm: tokenColor(probe, '--km-warm'),
				term: tokenColor(probe, '--km-term'),
				paper: tokenColor(probe, '--km-paper'),
			};
		};
		readColors();

		/* -------------------------------------------------------------- GPU scene data */
		const scene: SceneData = {
			hf: { f: new Float32Array(4), gw: 2, gh: 2 },
			edges: new Float32Array(edges.length * EDGE_STRIDE),
			edgeCount: edges.length,
			nodes: new Float32Array(drawNodes.length * NODE_STRIDE),
			nodeCount: drawNodes.length,
		};
		// The height field only feeds the GPU terrain: computed when a GPU tier is tried, never in SVG mode.
		let hfLayout: Layout | null = null;
		const buildHeight = () => {
			if (hfLayout === layout) return;
			scene.hf = heightField(peaksFor(G, layout), W, H, layout === 'tall' ? 300 : 520);
			hfLayout = layout;
		};
		const buildScene = () => {
			edges.forEach((e, i) => {
				const ax = e.a.wx, ay = e.a.wy, bx = e.b.wx, by = e.b.wy;
				const dx = bx - ax, dy = by - ay;
				const bend = e.k === 'trail' ? 0.06 : e.k.startsWith('term') ? 0.18 : 0.14;
				scene.edges.set([ax, ay, (ax + bx) / 2 - dy * bend, (ay + by) / 2 + dx * bend, bx, by, KIND[e.k], 0, 1, Math.hypot(dx, dy) * 1.04], i * EDGE_STRIDE);
			});
			drawNodes.forEach((n, j) => {
				const r = { post: 6.5, module: 6.2, lab: 4.2 + Math.min(3, (n.usedBy ?? 0) * 0.5), term: 2.1 }[n.type as 'post'] ?? 2;
				scene.nodes.set([n.wx, n.wy, NKIND[n.type], r, 0, 1], j * NODE_STRIDE);
			});
		};
		const writeState = () => {
			for (let i = 0; i < edges.length; i++) {
				scene.edges[i * EDGE_STRIDE + 7] = eState[i].e;
				scene.edges[i * EDGE_STRIDE + 8] = eState[i].v;
			}
			drawNodes.forEach((n, j) => {
				scene.nodes[j * NODE_STRIDE + 4] = nState[n.i].e;
				scene.nodes[j * NODE_STRIDE + 5] = nState[n.i].v;
			});
		};
		buildScene();

		/* -------------------------------------------------------------- SVG mode (no GPU): the poster follows the camera */
		let svgMode = false;
		let hlSvg: SVGSVGElement | null = null;
		const SVGNS = 'http://www.w3.org/2000/svg';
		const enterSVG = () => {
			svgMode = true;
			plate.classList.remove('gpu-ready');
			plate.classList.add('svg-mode');
			if (!hlSvg) {
				hlSvg = document.createElementNS(SVGNS, 'svg');
				hlSvg.setAttribute('class', 'km-hl');
				hlSvg.setAttribute('aria-hidden', 'true');
				hlSvg.setAttribute('preserveAspectRatio', 'none');
				labelsEl.before(hlSvg);
				cleanups.push(() => hlSvg?.remove());
			}
			drawHighlights();
		};
		const drawHighlights = () => {
			if (!hlSvg) return;
			let s = '';
			for (const i of lit) {
				const o = i * EDGE_STRIDE;
				const e = scene.edges;
				const k = edges[i].k;
				s += `<path class="h-${k}" d="M${e[o]} ${e[o + 1]}Q${e[o + 2]} ${e[o + 3]} ${e[o + 4]} ${e[o + 5]}"/>`;
			}
			const sel = selId ? byId.get(selId) : hoverId ? byId.get(hoverId) : null;
			if (sel) s += `<circle class="h-ring" cx="${sel.wx}" cy="${sel.wy}" r="${14 / cam.k}"/>`;
			hlSvg.innerHTML = s;
			if (s) hlSvg.setAttribute('viewBox', `${cam.x - vw / 2 / cam.k} ${cam.y - vh / 2 / cam.k} ${vw / cam.k} ${vh / cam.k}`);
		};

		/* -------------------------------------------------------------- frame loop */
		const U = new Float32Array(40);
		let intro = 0;
		let reveal = { terrain: 1, edges: 1, nodes: 1 };
		let focusAmt = 0;
		const focusPos = [0, 0];
		let lastTs = 0;
		const invalidate = () => {
			if (!raf && !dead) raf = requestAnimationFrame(frame);
		};
		const writeUniforms = (ts: number, flow: boolean) => {
			U.set([vw, vh, dpr, ts / 1000, cam.x, cam.y, cam.k, home.k, focusPos[0], focusPos[1], focusAmt, CONTOUR_LEVELS, reveal.terrain, reveal.edges, reveal.nodes, isDark() ? 1 : 0]);
			U.set(colors.ink, 16);
			U.set(colors.acc, 20);
			U.set(colors.warm, 24);
			U.set(colors.term, 28);
			U.set(colors.paper, 32);
			U.set([W, H, flow ? 1 : 0, 0], 36);
		};
		function frame(ts: number) {
			raf = 0;
			if (dead) return;
			const dt = Math.min(64, ts - (lastTs || ts)) / 1000;
			lastTs = ts;
			let again = false;
			if (flight) {
				const x = Math.min(1, (ts - flight.t0) / flight.dur);
				const [px, py, pw] = flight.f(flight.ease(x));
				cam.x = px;
				cam.y = py;
				cam.k = vw / pw;
				if (x >= 1) {
					const r = flight.resolve;
					flight = null;
					r();
				} else again = true;
			}
			if (intro) {
				const e = ts - intro;
				reveal.terrain = easeInOut(Math.min(1, e / 1300));
				reveal.edges = easeInOut(Math.min(1, Math.max(0, (e - 450) / 1000)));
				reveal.nodes = easeOut(Math.min(1, Math.max(0, (e - 150) / 700)));
				if (e < 1500) again = true;
				else intro = 0;
			}
			const lerp = 1 - Math.exp(-dt / 0.085);
			let moving = false;
			for (const s of nState) {
				s.e += (s.te - s.e) * lerp;
				s.v += (s.tv - s.v) * lerp;
				if (Math.abs(s.te - s.e) + Math.abs(s.tv - s.v) > 0.003) moving = true;
			}
			for (const s of eState) {
				s.e += (s.te - s.e) * lerp;
				s.v += (s.tv - s.v) * lerp;
				if (Math.abs(s.te - s.e) + Math.abs(s.tv - s.v) > 0.003) moving = true;
			}
			if (moving) again = true;
			const flow = !reduced && !!(selId || hoverId) && ts < flowUntil;
			if (flow) again = true;
			if (renderer) {
				writeState();
				const focus = byId.get((selId || hoverId) ?? '');
				focusAmt += ((focus ? 1 : 0) - focusAmt) * lerp;
				if (focus) {
					focusPos[0] = focus.wx;
					focusPos[1] = focus.wy;
				}
				writeUniforms(ts, flow);
				if (!renderer.draw(U, scene)) fallback('draw failed');
			} else if (svgMode) {
				placePoster();
				// re-laying out the highlight paths costs a layout per frame: only while something is traced
				if (hlSvg?.firstChild) hlSvg.setAttribute('viewBox', `${cam.x - vw / 2 / cam.k} ${cam.y - vh / 2 / cam.k} ${vw / cam.k} ${vh / cam.k}`);
			}
			layoutLabels();
			updateGutter();
			updateReadout();
			if (again) invalidate();
		}
		const placePoster = () => {
			if (!posterImg) return;
			posterImg.style.width = `${W * cam.k}px`;
			posterImg.style.left = `${(0 - cam.x) * cam.k + vw / 2}px`;
			posterImg.style.top = `${(0 - cam.y) * cam.k + vh / 2}px`;
		};

		/* -------------------------------------------------------------- labels: semantic zoom + greedy collision */
		let tier = -1;
		const tierOf = (k: number) => (k < 0.78 ? 0 : k < 1.55 ? 1 : 2);
		let hudBoxes: { x: number; y: number; w: number; h: number }[] = [];
		const measureHud = () => {
			const pr = plate.getBoundingClientRect();
			hudBoxes = [...plate.querySelectorAll<HTMLElement>('.km-gutter, .km-card:not([hidden])')].map((h) => {
				const r = h.getBoundingClientRect();
				return { x: r.left - pr.left - 6, y: r.top - pr.top - 6, w: r.width + 12, h: r.height + 12 };
			});
			const cr = cardEl.hidden ? null : cardEl.getBoundingClientRect();
			const sheet = !!cr && cr.width > vw * 0.7;
			slack.x = cr && !sheet ? cr.width + 30 : 0;
			slack.y = cr && sheet ? cr.height + 20 : 0;
		};
		// Essay and module labels sit above or below their dot. On a collision an essay tries the other
		// side; a module number tries the other side, then beside its ring (it never loses to an essay).
		const SIDES = ['', 'flip', 'side'];
		const sizeTier = new WeakMap<Label, number>();
		const range = document.createRange();
		const inkBox = (el: Element) => {
			let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
			const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			for (let tn = walk.nextNode(); tn; tn = walk.nextNode()) {
				if (!tn.textContent?.trim()) continue;
				range.selectNodeContents(tn);
				for (const q of range.getClientRects()) {
					if (!q.width) continue;
					x0 = Math.min(x0, q.left);
					y0 = Math.min(y0, q.top);
					x1 = Math.max(x1, q.right);
					y1 = Math.max(y1, q.bottom);
				}
			}
			return x1 > x0 ? { left: x0, top: y0, width: x1 - x0, height: y1 - y0 } : el.getBoundingClientRect();
		};
		/** One read pass (no writes in between): label boxes relative to their anchor. */
		const measure = () => {
			measureHud();
			const lr = labelsEl.getBoundingClientRect();
			for (const L of labels) {
				// lab, term and tag labels don't change size with the tier: measure them once
				if (sizeTier.has(L) && (L.kind === 'lab' || L.kind === 'term' || L.kind === 'tag')) continue;
				const lbl = L.el.querySelector('.lbl') ?? L.el;
				const flippable = L.kind === 'post' || L.kind === 'module';
				// essays and modules: the ink of the (balanced, centred) lines, not the max-width block around them
				const r = flippable ? inkBox(lbl) : lbl.getBoundingClientRect();
				L.bw = r.width;
				L.bh = r.height;
				if (L.kind === 'post' && layout === 'tall') {
					// portrait essays: beside the dot, right then left
					L.bx = 11;
					L.by = -L.bh / 2;
					L.cands = [[L.bx, L.by], [-11 - L.bw, L.by]];
				} else if (flippable) {
					const gap = L.kind === 'post' ? 13 : 11;
					const above = !(layout === 'wide' && L.el.classList.contains('r-b'));
					const up = -(L.bh + gap);
					L.bx = -L.bw / 2;
					L.by = above ? up : gap;
					L.cands = [[L.bx, L.by], [L.bx, above ? gap : up]];
					if (L.kind === 'module') L.cands.push([9, -L.bh / 2]);
				} else {
					L.bx = r.left - lr.left - L.sx;
					L.by = r.top - lr.top - L.sy;
					L.cands = [[L.bx, L.by]];
				}
				sizeTier.set(L, tier);
			}
		};
		const layoutLabels = () => {
			const nt = tierOf(cam.k);
			if (nt !== tier) {
				tier = nt;
				labelsEl.classList.remove('tier-0', 'tier-1', 'tier-2');
				labelsEl.classList.add(`tier-${tier}`);
				measure();
				if (booted && saidTier !== tier) {
					saidTier = tier;
					say(t(`say${tier}`), 700);
				}
			}
			const placed = hudBoxes.slice();
			const titles: { x: number; y: number; w: number; h: number }[] = [];
			const pad = 3;
			const underHud = (x: number, y: number, w: number, h: number) =>
				hudBoxes.some((p) => x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y);
			const hits = (x: number, y: number, w: number, h: number) =>
				placed.some((p) => x < p.x + p.w + pad && x + w + pad > p.x && y < p.y + p.h + pad && y + h + pad > p.y);
			const inside = (x: number, y: number, w: number, h: number) => x >= 2 && y >= 2 && x + w <= vw - 2 && y + h <= vh - 2;
			// node discs block labels too, so a title never sits on a neighbour's dot
			for (const n of drawNodes) {
				if (n.type === 'term') continue;
				const [x, y] = w2s(n.wx, n.wy);
				if (x < -20 || y < -20 || x > vw + 20 || y > vh + 20) continue;
				const r = n.type === 'lab' ? 5 : 7;
				placed.push({ x: x - r, y: y - r, w: 2 * r, h: 2 * r });
			}
			for (const L of labelOrder) {
				const [sx, sy] = w2s(L.wx, L.wy);
				L.sx = sx;
				L.sy = sy;
				L.el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
				let show = L.minTier <= tier || L.forced;
				let pick = L.side;
				// an essay near the edge slides along, up to most of its width, instead of going under the gutter
				let nx = 0;
				if (L.kind === 'post' && layout === 'wide') {
					const x = sx + L.bx;
					const lim = L.bw / 2 - 10;
					if (x < 38) nx = Math.min(lim, 38 - x);
					else if (x + L.bw > vw - 4) nx = -Math.min(lim, x + L.bw - (vw - 4));
				}
				if (show) {
					// the selected place may overlap anything but the card; essays are never culled (a bare dot says too little)
					const keep = L.must || L.kind === 'post';
					let ok = -1;
					for (let c = 0; c < L.cands.length && ok < 0; c++) {
						const x = sx + L.cands[c][0] + nx;
						const y = sy + L.cands[c][1];
						if (!inside(x, y, L.bw, L.bh)) continue;
						if (L.n?.id !== selId && underHud(x, y, L.bw, L.bh)) continue;
						if (!L.must && hits(x, y, L.bw, L.bh)) continue;
						ok = c;
					}
					if (ok < 0) {
						// nothing clean: the selected place and essays still show, on the side that stays on the plate
						const onPlate = sx > -L.bw * 0.6 && sx < vw + L.bw * 0.6 && sy > 0 && sy < vh;
						ok = L.cands.findIndex(([dx, dy]) => inside(sx + dx + nx, sy + dy, L.bw, L.bh));
						if (ok < 0) ok = 0;
						const [dx, dy] = L.cands[ok];
						const bx0 = sx + dx + nx;
						const by0 = sy + dy;
						// ...but never one essay title over another (zoomed out past home, there isn't room for all)
						const overTitle = !L.must && titles.some((p) => bx0 < p.x + p.w && bx0 + L.bw > p.x && by0 < p.y + p.h && by0 + L.bh > p.y);
						show = keep && onPlate && !overTitle && (L.n?.id === selId || !underHud(bx0, by0, L.bw, L.bh));
					}
					pick = ok;
					if (show) {
						const box = { x: sx + L.cands[pick][0] + nx, y: sy + L.cands[pick][1], w: L.bw, h: L.bh };
						placed.push(box);
						if (L.kind === 'post') titles.push(box);
					}
				}
				if (show && nx !== L.nx) {
					L.nx = nx;
					L.el.style.setProperty('--nx', `${nx.toFixed(1)}px`);
				}
				// a hidden label keeps its side, so it doesn't jump while fading out
				if (show && pick !== L.side) {
					if (SIDES[L.side]) L.el.classList.remove(SIDES[L.side]);
					if (SIDES[pick]) L.el.classList.add(SIDES[pick]);
					L.side = pick;
				}
				if (show === L.off) {
					L.off = !show;
					L.el.classList.toggle('off', !show);
				}
			}
		};

		/* -------------------------------------------------------------- gutter rulers + readout */
		const gutterEls = [...plate.querySelectorAll<HTMLElement>('.km-rg')];
		const updateGutter = () => {
			for (const el of gutterEls) {
				const r = G.regions.find((x) => x.key === el.dataset.r);
				if (!r) continue;
				const sy = ((layout === 'tall' ? r.py : r.y) - cam.y) * cam.k + vh / 2;
				el.style.setProperty('--gy', `${Math.max(48, Math.min(vh - 48, sy))}px`);
				el.classList.toggle('out', sy < -60 || sy > vh + 60);
			}
		};
		// The caption's second line: how to move at the home view, then zoom + what the zoom shows.
		// The renderer only appears for ?debug / ?renderer= (it's an internal detail, not editorial copy).
		const debug = params.has('debug') || params.has('renderer');
		let lastReadout = '';
		let hintHold = 0;
		const updateReadout = () => {
			if (!readoutEl || performance.now() < hintHold) return;
			const z = cam.k / home.k;
			let s = Math.abs(z - 1) < 0.05 ? esc(coarse ? t('hintTouch') : t('hintMouse')) : `<b>${z.toFixed(1)}×</b> · ${t(`tier${tier}`)}`;
			if (debug) s = `<b>${renderer ? renderer.name : svgMode ? 'svg' : t('poster')}</b> · ${s}`;
			if (s !== lastReadout) {
				readoutEl.innerHTML = s;
				lastReadout = s;
			}
		};
		// Screen readers hear meaningful changes only (a new zoom tier, a selection), never every zoom step.
		let sayTimer = 0;
		let saidTier = -1;
		const say = (msg: string, delay = 0) => {
			clearTimeout(sayTimer);
			if (!liveEl) return;
			sayTimer = window.setTimeout(() => {
				if (!dead) liveEl.textContent = msg;
			}, delay);
		};
		cleanups.push(() => clearTimeout(sayTimer));
		let hintTimer = 0;
		const flashHint = (s: string, ms = 2200) => {
			clearTimeout(hintTimer);
			if (!coarse && readoutEl) {
				hintHold = performance.now() + ms;
				readoutEl.innerHTML = `<b>${esc(s)}</b>`;
				hintTimer = window.setTimeout(() => {
					hintHold = 0;
					lastReadout = '';
					updateReadout();
				}, ms);
				return;
			}
			if (!hintEl || selId) return;
			hintEl.textContent = s;
			invalidate();
			hintTimer = window.setTimeout(() => {
				if (hintEl) hintEl.textContent = '';
				invalidate();
			}, ms);
		};
		cleanups.push(() => clearTimeout(hintTimer));

		/* -------------------------------------------------------------- card */
		const name = (n: N) => n.short || n.title;
		const glyph = (n: N) => `<span class="g g-${n.type === 'tag' ? 'term' : n.type}" aria-hidden="true"></span>`;
		const chips = (list: N[]) =>
			`<div class="nbs">${list.map((n) => `<button type="button" data-go="${esc(n.id)}">${glyph(n)}${esc(name(n))}</button>`).join('')}</div>`;
		const pad2 = (n?: number) => String(n ?? 0).padStart(2, '0');
		const renderCard = (n: N) => {
			const s: string[] = [];
			let eyebrow = '';
			let action = '';
			let grades = '';
			const of = (k: string, dir?: 'in' | 'out') => n.adj.filter((a) => a.k === k && (!dir || a.dir === dir)).map((a) => a.n);
			if (n.type === 'post') {
				eyebrow = `<span class="k">${t('post')}</span><span>${n.date}</span><span>${n.minutes} ${t('min')}</span>`;
				const cites = of('cites');
				const links = of('links', 'out');
				const back = of('links', 'in');
				const uses = of('uses');
				if (cites.length) s.push(`<p class="nb-h">${t('cites')} · ${cites.length}</p>${chips(cites)}`);
				if (links.length) s.push(`<p class="nb-h">${t('links')} · ${links.length}</p>${chips(links)}`);
				if (back.length) s.push(`<p class="nb-h">${t('linkedFrom')} · ${back.length}</p>${chips(back)}`);
				if (uses.length) s.push(`<p class="nb-h">${t('usesC')} · ${uses.length}</p>${chips(uses)}`);
				action = t('read');
			} else if (n.type === 'module') {
				eyebrow = `<span class="k">${t('module')} ${pad2(n.order)}</span><span>${t('phase')} ${pad2(n.phase)}</span><span>${n.minutes} ${t('min')}</span>`;
				const g = n.grades ?? { A: 0, B: 0, C: 0, D: 0 };
				grades = `<p class="grades"><span class="sr-only">${n.sources} ${t('sources')}: </span>${(['A', 'B', 'C', 'D'] as const)
					.filter((k) => g[k])
					.map((k) => `<span aria-hidden="true" class="gr gr-${k.toLowerCase()}">${k}·${g[k]}</span>`)
					.join('')}<span aria-hidden="true" class="gr-n">${n.sources} ${t('sources')}</span></p>`;
				const cited = of('cites');
				const trail = of('trail').sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
				const terms = of('term');
				if (cited.length) s.push(`<p class="nb-h">${t('citedBy')} · ${cited.length}</p>${chips(cited)}`);
				s.push(`<p class="nb-h">${t('trail')}</p>${chips(trail)}`);
				if (terms.length) s.push(`<p class="nb-h">${t('terms')} · ${terms.length}</p>${chips(terms)}`);
				action = t('open');
			} else if (n.type === 'lab') {
				const cat = G.categories.find((c) => c.key === n.category);
				eyebrow = `<span class="k">${t('lab')}</span><span>${esc(cat?.label ?? '')}</span><span>${t(n.status ?? 'stable')}</span>`;
				const used = of('uses');
				const usedM = of('uses-m');
				if (used.length || usedM.length) s.push(`<p class="nb-h">${t('usedIn')} · ${used.length + usedM.length}</p>${chips([...used, ...usedM])}`);
				action = t('live');
			} else if (n.type === 'term') {
				eyebrow = `<span class="k">${t('term')}</span>${n.keyword ? `<span>${t('keyword')}</span>` : ''}`;
				const ms = (n.modules ?? []).map((sl) => byId.get(`module:${sl}`)).filter((x): x is N => !!x);
				if (ms.length) s.push(`<p class="nb-h">${t('appears')} · ${ms.length}</p>${chips(ms)}`);
				action = t('def');
			} else if (n.type === 'tag') {
				eyebrow = `<span class="k">${t('tag')}</span><span>${n.count} ${n.count === 1 ? t('essay') : t('essays')}</span>`;
				s.push(`<p class="nb-h">${t('tagged')}</p>${chips(n.adj.map((a) => a.n))}`);
			}
			cardEl.dataset.type = n.type;
			cardEl.innerHTML = `<div class="km-scroll"><p class="eyebrow">${eyebrow}</p><h2 id="km-card-title" tabindex="-1">${esc(n.title)}</h2>${n.desc ? `<p class="desc">${esc(n.desc)}</p>` : ''}${grades}<div class="nb-wrap">${s.join('')}</div></div>
				<div class="act">${n.href ? `<a class="go" href="${esc(n.href)}" data-act="${esc(n.id)}">${action} <span aria-hidden="true">→</span></a>` : '<span></span>'}<button type="button" class="close">${t('close')}</button></div>`;
		};

		// Scrollers fade their last row while there's more below (CSS keys off these two classes).
		const fadeEdge = (el: HTMLElement) => {
			const over = el.scrollHeight > el.clientHeight + 2;
			el.classList.toggle('overflows', over);
			el.classList.toggle('at-end', !over || el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
		};
		cardEl.addEventListener('scroll', (e) => (e.target as HTMLElement).classList?.contains('km-scroll') && fadeEdge(e.target as HTMLElement), { capture: true, signal });

		/* -------------------------------------------------------------- select / frame */
		const frameFor = (n: N): Cam => {
			const pr = plate.getBoundingClientRect();
			const cr = cardEl.hidden ? null : cardEl.getBoundingClientRect();
			const sheet = !!cr && cr.width > vw * 0.7; // phones: the card is a bottom sheet
			const R = { x0: 44, y0: 10, x1: vw - 14, y1: vh - 10 };
			if (cr && !sheet) R.x1 = Math.max(R.x0 + 120, cr.left - pr.left - 18);
			if (cr && sheet) R.y1 = Math.max(R.y0 + 120, cr.top - pr.top - 12);
			const rw = R.x1 - R.x0;
			const rh = R.y1 - R.y0;
			const pts: N[] = [n];
			if (n.type === 'post' || n.type === 'lab' || n.type === 'tag') {
				for (const a of n.adj) if (['cites', 'links', 'uses', 'tag'].includes(a.k) && a.n.type !== 'tag') pts.push(a.n);
				if (n.type === 'tag') pts.push(...n.adj.map((a) => a.n));
			}
			let k: number;
			let bx: number;
			let by: number;
			if (sheet) {
				// phones: the free strip above the sheet is small, so centre the place itself, a little closer
				// (a module closer still, so the terms around it have room to read)
				k = Math.min(kMax(), Math.max(cam.k, home.k * (n.type === 'module' ? 3 : 1.7)));
				bx = n.wx;
				by = n.wy;
			} else if (pts.length === 1) {
				k = Math.max(cam.k, Math.min(kMax(), n.type === 'term' ? 2.3 : n.type === 'module' ? 1.7 : 1.2));
				if (layout === 'tall') k = Math.max(cam.k, Math.min(kMax(), home.k * 2.6));
				bx = n.wx;
				by = n.wy;
			} else {
				let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
				for (const p of pts) {
					x0 = Math.min(x0, p.wx);
					y0 = Math.min(y0, p.wy);
					x1 = Math.max(x1, p.wx);
					y1 = Math.max(y1, p.wy);
				}
				x0 -= 120;
				x1 += 120;
				y0 -= 110;
				y1 += 70;
				// never below the home scale: that's the smallest view where every essay title has room
				k = Math.min(1.6, Math.max(home.k, Math.min(rw / (x1 - x0), rh / (y1 - y0))));
				bx = (x0 + x1) / 2;
				by = (y0 + y1) / 2;
			}
			// put the frame's centre at the centre of the free region (left of / above the card)
			const fcx = (R.x0 + R.x1) / 2;
			const fcy = (R.y0 + R.y1) / 2;
			const c = { x: bx - (fcx - vw / 2) / k, y: by - (fcy - vh / 2) / k, k };
			// then make sure the selected place's own label, not just its dot, clears the card and the edges
			const L = n.L;
			if (L && L.bw) {
				const sx = (n.wx - c.x) * k + vw / 2;
				const sy = (n.wy - c.y) * k + vh / 2;
				const lx0 = sx + L.bx * 1.06 - 6;
				const lx1 = sx + (L.bx + L.bw) * 1.06 + 6;
				const ly0 = sy + Math.min(0, L.by * 1.06) - 6;
				const ly1 = sy + Math.max(0, (L.by + L.bh) * 1.06) + 6;
				if (lx1 > R.x1) c.x += (lx1 - R.x1) / k;
				else if (lx0 < R.x0) c.x -= (R.x0 - lx0) / k;
				if (ly1 > R.y1) c.y += (ly1 - R.y1) / k;
				else if (ly0 < R.y0) c.y -= (R.y0 - ly0) / k;
			}
			return c;
		};
		let returnFocusTo: HTMLElement | null = null;
		/** Where the camera was before the current selection flew in: what Back from a dive surfaces to. */
		let preDive: Cam | null = null;
		const html = document.documentElement;
		cleanups.push(() => html.classList.remove('km-card-open', 'km-plate-inview'));
		const select = (id: string | null, opts: { noFly?: boolean; keepHash?: boolean; focusCard?: boolean; noScroll?: boolean } = {}) => {
			const n = id ? byId.get(id) : null;
			if (n && !opts.noFly && n.id !== selId) preDive = { ...cam };
			hoverId = null;
			selId = n ? n.id : null;
			html.classList.toggle('km-card-open', !!n);
			if (n) {
				clearTimeout(hintTimer);
				if (hintEl) hintEl.textContent = '';
				renderCard(n);
				cardEl.hidden = false;
				const sc = cardEl.querySelector<HTMLElement>('.km-scroll');
				sc?.scrollTo(0, 0);
				if (sc) fadeEdge(sc);
				cardEl.setAttribute('aria-labelledby', 'km-card-title');
				measureHud();
				if (!opts.noFly) flyTo(frameFor(n));
				if (!opts.keepHash) history.replaceState(history.state, '', `#n=${encodeURIComponent(n.id)}`);
				if (opts.focusCard) {
					returnFocusTo = n.L?.el ?? null;
					cardEl.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
				} else say(`${t('sayPick')}: ${n.title}`, 250);
				// phones: the card is a sheet at the plate's bottom edge, so bring that edge on screen
				if (slack.y && !opts.noScroll && !isFullscreen()) {
					const pr = plate.getBoundingClientRect();
					if (pr.bottom > innerHeight - 4) plate.scrollIntoView({ block: 'end', behavior: reduced ? 'auto' : 'smooth' });
				}
			} else {
				cardEl.hidden = true;
				measureHud();
				if (!opts.keepHash && location.hash.startsWith('#n=')) history.replaceState(history.state, '', location.pathname + location.search);
			}
			recomputeTargets();
		};

		/* -------------------------------------------------------------- leaving: dive into the place, then navigate */
		// Was the last input a key? Then focus comes back to the place after Back (no focus ring for mouse users).
		let viaKeyboard = false;
		document.addEventListener('keydown', () => (viaKeyboard = true), { capture: true, signal });
		document.addEventListener('pointerdown', () => (viaKeyboard = false), { capture: true, signal });
		const go = async (n: N, href: string) => {
			try {
				sessionStorage.setItem(RETURN_KEY, JSON.stringify({ path: location.pathname, cam: preDive ?? home, sel: selId, layout, kbd: viaKeyboard, t: Date.now() }));
			} catch {
				/* storage blocked: we just won't surface where we left */
			}
			if (!reduced) {
				labelsEl.classList.add('diving');
				cardEl.hidden = true;
				await flyTo({ x: n.wx, y: n.wy, k: Math.min(kMax(), Math.max(cam.k * 2.2, 2.4)) }, { duration: 460, ease: smooth });
			}
			if (dead) return;
			try {
				await navigate(href);
			} catch {
				location.href = href;
			}
		};

		/* -------------------------------------------------------------- input */
		let drag: { start: number[]; cam: Cam; moved: boolean; id: number; type: string; down: Element | null; pinch?: boolean; d0?: number; mid?: number[] } | null = null;
		let suppressClick = 0;
		const pointers = new Map<number, number[]>();
		let engaged = false;
		const hitTest = (sx: number, sy: number) => {
			let best: N | null = null;
			let bd = 18 * 18;
			for (const n of drawNodes) {
				if (n.type === 'term' && tier < 1) continue;
				const [x, y] = w2s(n.wx, n.wy);
				const d = ((x - sx) ** 2 + (y - sy) ** 2) * (n.type === 'term' ? 1.6 : 1);
				if (d < bd) {
					bd = d;
					best = n;
				}
			}
			return best;
		};
		const local = (e: PointerEvent | MouseEvent | WheelEvent) => {
			const r = plate.getBoundingClientRect();
			return [e.clientX - r.left, e.clientY - r.top];
		};
		const inUI = (el: EventTarget | null) => !!(el as Element | null)?.closest?.('.km-card, .km-skip');
		const setFree = () => plate.classList.toggle('km-free', cam.k > home.k * 1.05 || isFullscreen());
		const opt = { signal };
		plate.addEventListener(
			'pointerdown',
			(e) => {
				if (inUI(e.target) || e.button > 0) return;
				engaged = true;
				pointers.set(e.pointerId, local(e));
				if (pointers.size === 1) drag = { start: local(e), cam: { ...cam }, moved: false, id: e.pointerId, type: e.pointerType, down: e.target as Element };
				if (pointers.size === 2) {
					const [a, b] = [...pointers.values()];
					drag = { start: a, id: -1, type: 'touch', down: null, pinch: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]), mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], cam: { ...cam }, moved: true };
				}
			},
			opt,
		);
		plate.addEventListener(
			'pointermove',
			(e) => {
				const p = local(e);
				if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
				if (drag?.pinch && pointers.size === 2) {
					const [a, b] = [...pointers.values()];
					const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
					const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
					const k = (drag.cam.k * d) / drag.d0!;
					const wx = (drag.mid![0] - vw / 2) / drag.cam.k + drag.cam.x;
					const wy = (drag.mid![1] - vh / 2) / drag.cam.k + drag.cam.y;
					Object.assign(cam, clampCam({ k, x: wx - (mid[0] - vw / 2) / k, y: wy - (mid[1] - vh / 2) / k }));
					flight = null;
					setFree();
					invalidate();
					return;
				}
				if (drag && !drag.pinch && drag.id === e.pointerId) {
					const dx = p[0] - drag.start[0];
					const dy = p[1] - drag.start[1];
					if (!drag.moved && Math.hypot(dx, dy) > 5) {
						drag.moved = true;
						plate.classList.add('grabbing');
						try {
							plate.setPointerCapture(e.pointerId);
						} catch {
							/* pointer already gone */
						}
					}
					if (drag.moved) {
						// touch at home zoom: horizontal only, so a vertical swipe still scrolls the page
						const ddy = drag.type === 'touch' && !plate.classList.contains('km-free') ? 0 : dy;
						Object.assign(cam, clampCam({ k: drag.cam.k, x: drag.cam.x - dx / cam.k, y: drag.cam.y - ddy / cam.k }));
						flight = null;
						invalidate();
					}
					return;
				}
				if (e.pointerType === 'mouse' && !inUI(e.target)) {
					const ndEl = (e.target as Element).closest?.('.nd') as HTMLElement | null;
					const n = ndEl ? byId.get(ndEl.dataset.id!) : hitTest(p[0], p[1]);
					const id = n ? n.id : null;
					plate.style.cursor = id ? 'pointer' : '';
					if (id !== hoverId) {
						hoverId = id;
						recomputeTargets();
					}
				}
			},
			opt,
		);
		const endPointer = (e: PointerEvent) => {
			pointers.delete(e.pointerId);
			if (!drag) return;
			const wasTap = !drag.moved && !drag.pinch && drag.id === e.pointerId && e.type === 'pointerup';
			if (pointers.size === 0 || drag.pinch) plate.classList.remove('grabbing');
			if (wasTap && !drag.down?.closest?.('.nd, .km-card, .km-skip')) {
				const p = local(e);
				const n = hitTest(p[0], p[1]);
				if (n && n.id === selId && n.href) go(n, n.href);
				else {
					select(n ? n.id : null);
				}
			}
			if (pointers.size === 0) {
				if (drag.moved) suppressClick = performance.now();
				drag = null;
				setFree();
			} else if (drag.pinch) {
				const [id, p] = [...pointers.entries()][0];
				drag = { start: p, cam: { ...cam }, moved: true, id, type: 'touch', down: null };
			}
		};
		plate.addEventListener('pointerup', endPointer, opt);
		plate.addEventListener('pointercancel', endPointer, opt);
		plate.addEventListener(
			'pointerleave',
			(e) => {
				if (e.pointerType !== 'mouse') return;
				engaged = false;
				if (hoverId) {
					hoverId = null;
					recomputeTargets();
				}
			},
			opt,
		);
		plate.addEventListener(
			'wheel',
			(e) => {
				if (inUI(e.target)) return;
				if (!(e.ctrlKey || e.metaKey || engaged || isFullscreen())) {
					flashHint(t('hintWheel'));
					return;
				}
				e.preventDefault();
				const [sx, sy] = local(e);
				const k = clampCam({ ...cam, k: cam.k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016)) }).k;
				const [wx, wy] = s2w(sx, sy);
				Object.assign(cam, clampCam({ k, x: wx - (sx - vw / 2) / k, y: wy - (sy - vh / 2) / k }));
				flight = null;
				setFree();
				invalidate();
			},
			{ passive: false, signal },
		);
		plate.addEventListener(
			'dblclick',
			(e) => {
				if (inUI(e.target) || (e.target as Element).closest('.nd')) return;
				const [sx, sy] = local(e);
				const [wx, wy] = s2w(sx, sy);
				flyTo({ x: wx, y: wy, k: cam.k * 2 }, { duration: 520 }).then(setFree);
			},
			opt,
		);

		// Label links: the first activation selects (card + traced lines), the second follows the link.
		labelsEl.addEventListener(
			'click',
			(e) => {
				const el = (e.target as Element).closest<HTMLElement>('.nd');
				if (!el || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
				if (performance.now() - suppressClick < 80) {
					e.preventDefault();
					return;
				}
				const n = byId.get(el.dataset.id!);
				if (!n) return;
				e.preventDefault();
				if (n.type === 'tag' || selId !== n.id) {
					select(n.id, { focusCard: e.detail === 0 });
					return;
				}
				if (n.href) go(n, n.href);
			},
			opt,
		);
		labelsEl.addEventListener(
			'dblclick',
			(e) => {
				const el = (e.target as Element).closest<HTMLElement>('.nd');
				const n = el && byId.get(el.dataset.id!);
				if (n?.href) {
					e.preventDefault();
					go(n, n.href);
				}
			},
			opt,
		);
		// The camera, not a native scroll, brings a focused place into view. The plate can't scroll
		// (overflow: clip, plus this guard), and a focus that scrolled the page to an off-plate label
		// is undone in the same task, before anything paints.
		const pin = (el: HTMLElement) => () => {
			if (el.scrollTop || el.scrollLeft) el.scrollTo(0, 0);
		};
		plate.addEventListener('scroll', pin(plate), opt);
		labelsEl.addEventListener('scroll', pin(labelsEl), opt);
		let pageScroll = [scrollX, scrollY];
		window.addEventListener('scroll', () => (pageScroll = [scrollX, scrollY]), { passive: true, signal });
		// Keyboard focus traces the place and keeps it on screen; Enter opens the card.
		labelsEl.addEventListener(
			'focusin',
			(e) => {
				const el = (e.target as Element).closest<HTMLElement>('.nd');
				if (!el) return;
				if (scrollX !== pageScroll[0] || scrollY !== pageScroll[1]) {
					window.scrollTo({ left: pageScroll[0], top: pageScroll[1], behavior: 'instant' });
					const pr = plate.getBoundingClientRect();
					if (pr.top < 0 || pr.bottom > innerHeight) plate.scrollIntoView({ block: 'nearest' });
				}
				pin(plate)();
				if (el.matches(':hover')) return;
				const n = byId.get(el.dataset.id!);
				if (!n) return;
				hoverId = n.id;
				recomputeTargets();
				const [sx, sy] = w2s(n.wx, n.wy);
				if (sx < 70 || sy < 50 || sx > vw - 70 || sy > vh - 50) flyTo({ x: n.wx, y: n.wy, k: Math.max(cam.k, n.type === 'lab' ? 0.8 : cam.k) }, { duration: 380 });
				else if (n.type === 'lab' && tier < 1) flyTo({ x: n.wx, y: n.wy, k: 0.8 }, { duration: 380 });
			},
			opt,
		);
		labelsEl.addEventListener(
			'focusout',
			() => {
				if (hoverId) {
					hoverId = null;
					recomputeTargets();
				}
			},
			opt,
		);
		labelsEl.addEventListener(
			'pointerover',
			(e) => {
				const el = (e.target as Element).closest<HTMLElement>('.nd');
				if (!el || e.pointerType !== 'mouse') return;
				if (hoverId !== el.dataset.id) {
					hoverId = el.dataset.id!;
					recomputeTargets();
				}
			},
			opt,
		);
		cardEl.addEventListener(
			'click',
			(e) => {
				const target = e.target as Element;
				const chip = target.closest<HTMLElement>('[data-go]');
				if (chip) {
					select(chip.dataset.go!, { focusCard: e.detail === 0 });
					return;
				}
				if (target.closest('.close')) {
					closeCard();
					return;
				}
				const act = target.closest<HTMLAnchorElement>('[data-act]');
				if (act && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
					const n = byId.get(act.dataset.act!);
					if (n) {
						e.preventDefault();
						go(n, act.getAttribute('href')!);
					}
				}
			},
			opt,
		);
		const closeCard = () => {
			const back = returnFocusTo ?? (selId ? byId.get(selId)?.L?.el : null);
			const hadFocus = cardEl.contains(document.activeElement);
			select(null);
			if (hadFocus && back) back.focus({ preventScroll: true });
			returnFocusTo = null;
		};
		cardEl.addEventListener(
			'keydown',
			(e) => {
				if (e.key === 'Escape') {
					e.stopPropagation();
					closeCard();
				}
			},
			opt,
		);

		// Keyboard: / searches, F toggles full screen; arrows, +/-, 0 and Esc act when focus is in the map.
		document.addEventListener(
			'keydown',
			(e) => {
				const ae = document.activeElement as HTMLElement | null;
				const typing = !!ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
				if (e.key === '/' && !typing) {
					e.preventDefault();
					q.focus();
					q.select();
					return;
				}
				const inFigure = root.contains(ae) || isFullscreen();
				if (!inFigure || typing || e.metaKey || e.ctrlKey || e.altKey) return;
				if (e.key === 'f' || e.key === 'F') {
					e.preventDefault();
					toggleFullscreen();
					return;
				}
				if (cardEl.contains(ae)) return;
				const step = 90 / cam.k;
				const m: Record<string, number[]> = { ArrowLeft: [-step, 0, 1], ArrowRight: [step, 0, 1], ArrowUp: [0, -step, 1], ArrowDown: [0, step, 1], '+': [0, 0, 1.5], '=': [0, 0, 1.5], '-': [0, 0, 1 / 1.5] };
				const mv = m[e.key];
				if (mv && plate.contains(ae)) {
					e.preventDefault();
					flyTo({ x: cam.x + mv[0], y: cam.y + mv[1], k: cam.k * mv[2] }, { duration: 240 }).then(setFree);
				}
				if (e.key === '0') {
					e.preventDefault();
					flyTo(home).then(setFree);
				}
				if (e.key === 'Escape' && selId) closeCard();
			},
			opt,
		);
		for (const b of root.querySelectorAll<HTMLButtonElement>('[data-zoom]')) {
			b.addEventListener(
				'click',
				() => {
					const z = b.dataset.zoom;
					if (z === 'fs') toggleFullscreen();
					else if (z === 'fit') {
						select(null);
						flyTo(home).then(setFree);
					} else flyTo({ ...cam, k: cam.k * (z === 'in' ? 1.6 : 1 / 1.6) }, { duration: 360 }).then(setFree);
				},
				opt,
			);
		}

		/* -------------------------------------------------------------- full screen */
		const isFullscreen = () => document.fullscreenElement === root || root.classList.contains('km-fs');
		const syncFs = () => {
			const on = isFullscreen();
			root.classList.toggle('is-fullscreen', on);
			if (fsBtn) {
				fsBtn.setAttribute('aria-pressed', String(on));
				fsBtn.setAttribute('aria-label', on ? fsBtn.dataset.labelExit! : fsBtn.dataset.labelEnter!);
				fsBtn.title = fsBtn.getAttribute('aria-label')!;
			}
			setFree();
		};
		const toggleFullscreen = async () => {
			if (isFullscreen()) {
				if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
				root.classList.remove('km-fs');
				document.documentElement.classList.remove('km-fs-lock');
			} else if (root.requestFullscreen && document.fullscreenEnabled) {
				await root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
					root.classList.add('km-fs');
					document.documentElement.classList.add('km-fs-lock');
				});
			} else {
				// No Fullscreen API (iOS Safari): a fixed overlay does the same job.
				root.classList.add('km-fs');
				document.documentElement.classList.add('km-fs-lock');
			}
			syncFs();
		};
		document.addEventListener('fullscreenchange', syncFs, opt);
		cleanups.push(() => document.documentElement.classList.remove('km-fs-lock'));

		/* -------------------------------------------------------------- search (APG combobox) */
		let hits: N[] = [];
		let active = -1;
		const runSearch = () => {
			const v = norm(q.value.trim());
			if (!v) {
				results.hidden = true;
				q.setAttribute('aria-expanded', 'false');
				q.removeAttribute('aria-activedescendant');
				return;
			}
			const rank: Record<string, number> = { post: 0, module: 1, lab: 2, term: 3, tag: 4 };
			hits = nodes
				.filter((n) => norm(`${n.title} ${n.short}`).includes(v))
				.sort((a, b) => rank[a.type] - rank[b.type] || (norm(a.short).startsWith(v) ? -1 : 0) - (norm(b.short).startsWith(v) ? -1 : 0))
				.slice(0, 8);
			active = hits.length ? 0 : -1;
			results.innerHTML =
				hits
					.map(
						(n, i) =>
							`<li role="option" id="km-hit-${i}" aria-selected="${i === active}" data-go="${esc(n.id)}">${glyph(n)}<span>${esc(n.title)}</span><small>${t(n.type)}</small></li>`,
					)
					.join('') || `<li class="none" role="option" aria-disabled="true" aria-selected="false"><span></span><span>${t('none')}</span></li>`;
			results.hidden = false;
			results.scrollTop = 0;
			fadeEdge(results);
			invalidate();
			q.setAttribute('aria-expanded', 'true');
			if (active >= 0) q.setAttribute('aria-activedescendant', 'km-hit-0');
			else q.removeAttribute('aria-activedescendant');
		};
		const pick = (id: string) => {
			results.hidden = true;
			q.setAttribute('aria-expanded', 'false');
			// Focus lands on the opened card's heading; Esc there returns to the place's label.
			select(id, { focusCard: true });
		};
		q.disabled = false;
		results.addEventListener('scroll', () => fadeEdge(results), opt);
		q.addEventListener('input', runSearch, opt);
		q.addEventListener(
			'keydown',
			(e) => {
				if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
					e.preventDefault();
					if (!hits.length) return;
					active = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
					results.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
					q.setAttribute('aria-activedescendant', `km-hit-${active}`);
					results.querySelector(`#km-hit-${active}`)?.scrollIntoView({ block: 'nearest' });
				} else if (e.key === 'Enter' && active >= 0 && !results.hidden) {
					e.preventDefault();
					pick(hits[active].id);
				} else if (e.key === 'Escape') {
					if (q.value) {
						q.value = '';
						runSearch();
					} else q.blur();
				}
			},
			opt,
		);
		results.addEventListener(
			'pointerdown',
			(e) => {
				const li = (e.target as Element).closest<HTMLElement>('[data-go]');
				if (li) {
					e.preventDefault();
					pick(li.dataset.go!);
				}
			},
			opt,
		);
		q.addEventListener('blur', () => window.setTimeout(() => {
			if (dead) return;
			results.hidden = true;
			q.setAttribute('aria-expanded', 'false');
			invalidate();
		}, 150), opt);

		/* -------------------------------------------------------------- theme, motion, layout changes */
		const mo = new MutationObserver(() => {
			readColors();
			invalidate();
		});
		mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
		cleanups.push(() => mo.disconnect());
		reducedMQ.addEventListener('change', () => {
			reduced = reducedMQ.matches;
			invalidate();
		}, opt);
		// Rotation / resize across the portrait breakpoint: switch the layout here, and let resize()
		// do the framing with the plate's new size (this event can arrive before the ResizeObserver).
		tallMQ.addEventListener('change', () => {
			layout = tallMQ.matches ? 'tall' : 'wide';
			applyLayout();
			buildScene();
			if (renderer) {
				buildHeight();
				renderer.setScene(scene);
			}
			resize(true);
		}, opt);

		/* -------------------------------------------------------------- size */
		let booted = false;
		const resize = (relayout = false) => {
			const nw = plate.clientWidth;
			const nh = plate.clientHeight;
			if (nw < 2 || nh < 2) return; // zero-size guard: hidden plate, nothing to fit
			const atHome = relayout || (Math.abs(cam.k - home.k) < 1e-6 && Math.abs(cam.x - home.x) < 1e-3);
			const sizeChanged = relayout || nw !== vw || nh !== vh;
			vw = nw;
			vh = nh;
			dpr = Math.min(devicePixelRatio || 1, innerWidth <= 760 ? 1.5 : 2);
			const cv = plate.querySelector('canvas');
			if (cv) {
				cv.width = Math.max(1, Math.round(vw * dpr));
				cv.height = Math.max(1, Math.round(vh * dpr));
			}
			computeHome();
			const sel = selId ? byId.get(selId) : null;
			if (sel && booted && sizeChanged) {
				// keep the selection framed for the new plate (and card) size, instantly
				flight?.resolve();
				flight = null;
				measureHud();
				Object.assign(cam, clampCam(frameFor(sel)));
			} else if (atHome || !booted) Object.assign(cam, home);
			clampCam(cam);
			setFree();
			tier = -1;
			invalidate();
		};
		const ro = new ResizeObserver(() => resize());
		ro.observe(plate);
		cleanups.push(() => ro.disconnect());
		resize();

		await yieldTask();
		if (dead) return;
		/* -------------------------------------------------------------- go live: JS positioning takes over in the same frame */
		plate.classList.add('is-live');
		plate.classList.remove('km-static');
		root.dataset.kmState = 'live';
		measure();
		layoutLabels();
		updateGutter();

		/* -------------------------------------------------------------- renderer: verified first frame or nothing */
		const fallback = (why: string) => {
			if (dead || svgMode) return;
			console.info('[map] renderer fallback:', why);
			renderer?.destroy();
			renderer = null;
			const next = plate.querySelector('canvas');
			next?.replaceWith(next.cloneNode(false));
			enterSVG();
			resize();
		};
		const freshCanvas = () => {
			const old = plate.querySelector('canvas')!;
			const cv = old.cloneNode(false) as HTMLCanvasElement;
			old.replaceWith(cv);
			cv.width = Math.max(1, Math.round(vw * dpr));
			cv.height = Math.max(1, Math.round(vh * dpr));
			return cv;
		};
		// Let the poster and the labels paint first: the GPU is an enhancement, never on the critical path.
		await posterImg?.decode().catch(() => {});
		await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
		if (dead) return;
		const force = params.get('renderer');
		// ?renderer=svg|webgl2|webgpu pins a tier for testing (webgpu also accepts a software adapter).
		const order = force === 'svg' ? [] : force === 'webgl2' ? ['webgl2'] : force === 'webgpu' ? ['webgpu'] : ['webgpu', 'webgl2'];
		if (order.length) {
			buildHeight();
			await yieldTask();
		}
		for (const kind of order) {
			if (dead) return;
			if (kind === 'webgpu' && !(navigator as any).gpu) continue;
			const cv = freshCanvas();
			let r: Renderer | null = null;
			try {
				r = kind === 'webgpu' ? await initWebGPU(cv, scene, (why) => fallback(why), { allowFallback: force === 'webgpu' }) : await initWebGL2(cv, scene, (why) => fallback(why), { allowSoftware: force === 'webgl2' });
				if (dead) {
					r.destroy();
					return;
				}
				reveal = { terrain: 1, edges: 1, nodes: 1 };
				writeState();
				writeUniforms(performance.now(), false);
				if (!r.draw(U, scene) || !verifyFrame(cv)) throw new Error('first frame did not paint');
				renderer = r;
				break;
			} catch (err) {
				console.info(`[map] ${kind} unavailable:`, (err as Error)?.message ?? err);
				r?.destroy();
			}
		}
		if (dead) return;

		// Arriving back from a place we dove into: start there and surface, skip the intro.
		let ret: { path: string; cam: Cam; sel: string | null; layout: Layout; kbd?: boolean; t: number } | null = null;
		try {
			ret = JSON.parse(sessionStorage.getItem(RETURN_KEY) || 'null');
			sessionStorage.removeItem(RETURN_KEY);
		} catch {
			ret = null;
		}
		const surfacing = !!ret && ret.path === location.pathname && Date.now() - ret.t < 15 * 60_000 && ret.layout === layout;
		let firstVisit = false;
		try {
			firstVisit = !sessionStorage.getItem(SEEN_KEY);
			sessionStorage.setItem(SEEN_KEY, '1');
		} catch {
			firstVisit = false;
		}

		if (renderer) {
			plate.classList.add('gpu-ready');
			if (!reduced && firstVisit && !surfacing) {
				reveal = { terrain: 0, edges: 0, nodes: 0 };
				intro = performance.now();
			}
		} else enterSVG();
		booted = true;
		saidTier = tierOf(cam.k);
		root.dataset.kmRenderer = renderer?.name ?? 'svg';

		await document.fonts?.ready;
		if (dead) return;
		measure();
		tier = -1;

		const deep = decodeURIComponent((location.hash.match(/^#n=(.+)$/) || [])[1] || '');
		if (surfacing && ret) {
			if (ret.sel && byId.has(ret.sel)) select(ret.sel, { noFly: true, keepHash: true, noScroll: true });
			const back = ret.cam;
			preDive = { ...back };
			const sel = ret.sel ? byId.get(ret.sel) : null;
			if (sel && !reduced) Object.assign(cam, clampCam({ x: sel.wx, y: sel.wy, k: Math.min(kMax(), Math.max(back.k * 2.2, 2.4)) }));
			const kbd = !!ret.kbd;
			flyTo(back, { duration: 820 }).then(() => {
				setFree();
				// a keyboard user picks up where they left: on the place they dove into
				if (kbd && !dead && sel?.L) sel.L.el.focus({ preventScroll: true });
			});
		} else if (deep && byId.has(deep)) {
			window.setTimeout(() => !dead && select(deep, { keepHash: true }), reduced ? 0 : 350);
		}
		invalidate();

		// One quiet hint, the first time the plate is actually on screen.
		const io = new IntersectionObserver(
			(ents) => {
				if (!ents.some((x) => x.isIntersecting)) return;
				io.disconnect();
				hintTimer = window.setTimeout(() => !dead && flashHint(coarse ? t('hintTouch') : t('hintMouse'), 4200), 1600);
			},
			{ threshold: 0.5 },
		);
		io.observe(plate);
		cleanups.push(() => io.disconnect());
		// The floating contact button steps aside while the plate fills the screen (it sits on the plate's corner).
		const inview = new IntersectionObserver((ents) => html.classList.toggle('km-plate-inview', ents[0]?.isIntersecting ?? false), { threshold: 0.35 });
		inview.observe(plate);
		cleanups.push(() => inview.disconnect());

		if (import.meta.env.DEV) {
			(window as any).__map = { cam, select, flyTo, home: () => home, byId, layout: () => layout, get renderer() { return renderer?.name ?? (svgMode ? 'svg' : 'none'); } };
			cleanups.push(() => delete (window as any).__map);
		}
	}
}
