/**
 * Knowledge map: the build-time content graph behind /map/ and /es/map/.
 *
 * Every node and edge comes from the real collections at build time:
 *   - blog posts (per language): dates, reading minutes, words, real URLs;
 *   - learn modules: phase, order, sources, words, real URLs;
 *   - lab components: the `meta` export of each demo file;
 *   - glossary terms: src/lib/learn-glossary.ts.
 * Edges are real relations in the MDX sources: a post that links a module
 * (`cites`), a post that links a post (`links`), a post or module that imports
 * a component it renders or links its lab page (`uses` / `uses-m`; layout
 * components count for every post), the course reading
 * order (`trail`), the post's tags (`tag`) and the modules that use a term.
 *
 * Positions are deterministic and shared by both languages (keyed by slug), so
 * /map/ and /es/map/ draw the same terrain. Two layouts are emitted: `wide`
 * for landscape plates and `tall` for portrait ones (phones), same semantics:
 * writing to the north, the course ridge in the middle, the lab to the south.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { GLOSSARY, findTerm } from './learn-glossary';
import { PHASES, baseSlug, moduleHref, readingMinutes, type Lang } from './learn';
import {
	CATEGORY_LABELS,
	CATEGORY_LABELS_ES,
	CATEGORY_ORDER,
	buildEntries,
	summaryFor,
	type DemoCategory,
} from '../components/lab/registry';
import type { MapEdge, MapGraph, MapIsland, MapMark, MapNode, Bounds } from './map/terrain';

type Post = CollectionEntry<'blog'>;
type Module = CollectionEntry<'learn'>;

const WIDE = { w: 2900, h: 1360 };
const TALL = { w: 1500, h: 3080 };

/** Short place names for the course modules (map labels only; full titles come from frontmatter). */
const MODULE_SHORT: Record<string, { en: string; es: string }> = {
	'llm-substrate': { en: 'The LLM substrate', es: 'El sustrato LLM' },
	'agent-as-policy': { en: 'Agent as policy', es: 'El agente como política' },
	'context-engineering': { en: 'Context engineering', es: 'Context engineering' },
	'tools-and-mcp': { en: 'Tools & MCP', es: 'Tools y MCP' },
	'agent-loop': { en: 'The control loop', es: 'El control loop' },
	retrieval: { en: 'Retrieval', es: 'Recuperación' },
	memory: { en: 'Memory', es: 'Memoria' },
	'human-in-the-loop': { en: 'Human in the loop', es: 'Human in the loop' },
	security: { en: 'Security', es: 'Seguridad' },
	evaluation: { en: 'Evaluation', es: 'Evaluación' },
	reasoning: { en: 'Reasoning', es: 'Razonamiento' },
	observability: { en: 'Observability', es: 'Observabilidad' },
	production: { en: 'Production', es: 'Producción' },
	'multi-agent': { en: 'Multi-agent', es: 'Multi-agente' },
	'post-training-rl': { en: 'Post-training & RL', es: 'Post-training y RL' },
	frontier: { en: 'The frontier', es: 'La frontera' },
};

const REGION_LABEL = {
	writing: { en: 'Writing', es: 'Escritura' },
	course: { en: 'Course', es: 'Curso' },
	lab: { en: 'Lab', es: 'Lab' },
} as const;

/** Prose words: the same stripping readingMinutes() does (imports, code fences, tags), plus JSX expressions. */
export function proseWords(body: string | undefined): number {
	const text = (body ?? '')
		.replace(/^import .*$/gm, '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\{[^}]*\}/g, ' ');
	return (text.match(/[\p{L}\p{N}'’]+/gu) ?? []).length;
}

const uniq = <T,>(a: T[]) => [...new Set(a)];
const shortTitle = (t: string) => t.split(':')[0].trim();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Components from src/components/blog/*.astro an MDX body actually renders:
 * imported AND used as a JSX tag under its local name. A dead import is not a use.
 */
const importsOf = (body = '') =>
	uniq(
		[...body.matchAll(/^import\s+(\w+)\s+from\s+['"][^'"]*components\/blog\/([A-Za-z]+)\.astro['"]/gm)]
			.filter(([, local]) => new RegExp(`<${local}[\\s/>]`).test(body))
			.map((m) => m[2]),
	);
/**
 * Components the BlogPost layout renders on every essay (src/layouts/BlogPost.astro),
 * so every post node "uses" them even though no MDX body imports them.
 */
const LAYOUT_COMPONENTS = ['FreshnessLine'];
/** Module slugs linked from a body (EN or ES URL shapes). */
const moduleLinksOf = (body = '') =>
	uniq([...body.matchAll(/\]\((?:\/es)?\/learn\/agentic-systems\/([a-z0-9-]+)\/?(?:#[^)]*)?\)/g)].map((m) => m[1])).filter(
		(s) => s !== 'glossary',
	);
/** Post slugs linked from a body. */
const postLinksOf = (body = '') =>
	uniq([...body.matchAll(/\]\(\/blog\/(?:es\/)?([a-z0-9-]+)\/?(?:#[^)]*)?\)/g)].map((m) => m[1]));
/** Lab demo slugs linked from a body. */
const labLinksOf = (body = '') => uniq([...body.matchAll(/\]\((?:\/es)?\/lab\/([a-z0-9-]+)\/?\)/g)].map((m) => m[1]));

interface LabItem {
	slug: string;
	title: string;
	category: DemoCategory;
	status: string;
	summary: { en?: string; es?: string };
	whyLen: number;
}

function labItems(): LabItem[] {
	const mods = import.meta.glob('../components/lab/demos/*.demo.astro', { eager: true });
	return buildEntries(mods).map((e) => ({
		slug: e.slug,
		title: e.meta.title,
		category: e.meta.category,
		status: e.meta.status ?? 'stable',
		summary: { en: summaryFor(e.meta, 'en'), es: summaryFor(e.meta, 'es') },
		whyLen: (e.meta.why ?? '').length,
	}));
}

/* ------------------------------------------------------------------ layout (language-independent) */

interface Structure {
	pos: Map<string, { x: number; y: number; px: number; py: number }>;
	islands: Map<DemoCategory, MapIsland>;
	termPrimary: Map<string, { modules: string[]; keyword: boolean }>;
	labOrder: LabItem[];
}

let structurePromise: Promise<Structure> | null = null;

/** Single words too common to stand for a term on their own (they come from splitting a headword). */
const TERM_STOP = new Set(['open', 'pair', 'pairs', 'position', 'token', 'tokens', 'tool', 'tools', 'policy', 'sampling', 'memory', 'agent', 'context', 'pattern', 'mode', 'state', 'search', 'error', 'trace', 'cache', 'budget']);
const isAcronym = (v: string) => /^(?=(?:[^A-Z]*[A-Z]){2})[A-Za-z0-9²-]{2,8}$/.test(v);
/** A derived match key must be specific: several words, an acronym, or one long uncommon word. */
const specific = (v: string) => (/\s/.test(v) || isAcronym(v) || (v.length >= 6 && !TERM_STOP.has(v.toLowerCase()))) && v.length > 1;

/**
 * Match keys for a glossary headword. The full headword (and the headword minus
 * its parenthetical) always count; pieces split off it — slash segments and
 * parentheticals — count only when specific(), so "Error analysis (open / axial
 * coding)" matches "axial coding" but never the bare word "open".
 */
function headwordVariants(term: string): { v: string; cs: boolean }[] {
	const out = new Map<string, boolean>();
	const add = (v: string, derived: boolean) => {
		v = v.trim().replace(/\s+/g, ' ');
		if (!v || (derived && !specific(v))) return;
		out.set(v, isAcronym(v));
	};
	add(term, false);
	const bare = term.replace(/\s*\(.*?\)\s*/g, ' ').trim();
	if (!bare.includes(' / ')) add(bare, bare !== term);
	for (const seg of bare.split(' / ')) add(seg, true);
	// a parenthetical that starts with a function word is a qualifier ("for an LLM"), not a name
	for (const m of term.matchAll(/\((.*?)\)/g)) if (!/^(for|a|an|the|in|of|with|as)\s/i.test(m[1])) for (const seg of m[1].split(' / ')) add(seg, true);
	for (const [v, cs] of [...out]) if (/[A-Za-z]$/.test(v)) out.set(`${v}s`, cs);
	return [...out].map(([v, cs]) => ({ v, cs }));
}

/** Prose a reader sees: no imports, no JSX tags or attributes, no link targets. */
const readableText = (body: string) =>
	body
		.replace(/^import .*$/gm, ' ')
		.replace(/<\/?[A-Za-z][^>]*>/g, ' ')
		.replace(/\]\([^)]*\)/g, '] ');

/**
 * Terms whose owner can't be read off the text reliably (the prose names the idea
 * in other words, or a headword piece is ambiguous). Keyed by glossary slug; the
 * value is the module that actually discusses it. Checked against the module text.
 */
const TERM_OWNER: Record<string, string> = {
	'position-verbosity-self-preference-bias': 'evaluation',
	'token-bpe-byte-pair-encoding': 'llm-substrate',
	'tool-for-an-llm': 'tools-and-mcp',
	'cot-faithfulness': 'reasoning',
	'control-plane-vs-execution-plane': 'production',
	'dual-llm-quarantine-pattern': 'security',
	'next-token-prediction': 'llm-substrate',
	'otel-genai-semantic-conventions': 'observability',
	'context-poisoning': 'context-engineering',
	'effort-parameter': 'llm-substrate',
	'context-window-vs-memory': 'context-engineering',
};
/** Headwords whose slash pieces only mean something with the shared noun ("position" alone is not "position bias"). */
const TERM_KEYS: Record<string, string[]> = {
	'position-verbosity-self-preference-bias': ['position bias', 'verbosity bias', 'self-preference bias', 'self-preference'],
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function buildStructure(): Promise<Structure> {
	const posts = (await getCollection('blog'))
		.filter((p) => p.data.lang === 'en' && !p.data.draft)
		.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
	const modules = (await getCollection('learn'))
		.filter((m) => (m.data.lang ?? 'en') === 'en')
		.sort((a, b) => a.data.order - b.data.order);
	const lab = labItems();
	const pos = new Map<string, { x: number; y: number; px: number; py: number }>();
	const set = (id: string, x: number, y: number, px: number, py: number) => pos.set(id, { x: r1(x), y: r1(y), px: r1(px), py: r1(py) });

	// Course ridge. Wide: one meandering trail west -> east. Tall: a serpentine of 4 rows.
	const nM = modules.length;
	const perRow = Math.ceil(nM / 4);
	modules.forEach((m, i) => {
		const t = nM > 1 ? i / (nM - 1) : 0.5;
		const x = 300 + t * (WIDE.w - 600);
		// a low meander: the ridge's highest ring still sits clear of a three-line essay title above it
		const y = 690 + 60 * Math.sin(t * Math.PI * 2.6 + 0.4) + (i % 2 ? 28 : -28);
		const row = Math.floor(i / perRow);
		const col = i % perRow;
		const c = row % 2 ? perRow - 1 - col : col;
		const px = 250 + (c / Math.max(1, perRow - 1)) * (TALL.w - 500);
		const py = 1540 + row * 230 + (i % 2 ? 26 : -26);
		set(`module:${baseSlug(m.id)}`, x, y, px, py);
	});

	// Writing coast. Wide: one band by date, two staggered rows. Tall: two columns, oldest first.
	const nP = posts.length;
	posts.forEach((p, i) => {
		const t = nP > 1 ? i / (nP - 1) : 0.5;
		const x = 360 + t * (WIDE.w - 720);
		const y = i % 2 === 0 ? 250 : 345;
		// tall: two columns, the title beside its dot (left-aligned), so rows can sit close
		const px = i % 2 === 0 ? 140 : 800;
		const py = 360 + Math.floor(i / 2) * 285 + (i % 2 ? 80 : 0);
		set(`post:${p.id}`, x, y, px, py);
	});
	// Keep wide-layout essay titles from colliding (1-D relaxation, >= 300 apart).
	const postIds = posts.map((p) => `post:${p.id}`);
	for (let it = 0; it < 60; it++) {
		for (let i = 0; i + 1 < postIds.length; i++) {
			const a = pos.get(postIds[i])!;
			const b = pos.get(postIds[i + 1])!;
			const d = b.x - a.x;
			if (d < 300) {
				a.x -= (300 - d) / 2;
				b.x += (300 - d) / 2;
			}
		}
	}

	// Lab: five islands. Wide: island x is pulled toward the essays that use its components.
	const usesByComp = new Map<string, string[]>();
	for (const p of posts) {
		const used = new Set([...importsOf(p.body), ...labLinksOf(p.body).map((s) => lab.find((l) => l.slug === s)?.title ?? '')]);
		for (const c of used) if (c) usesByComp.set(c, [...(usesByComp.get(c) ?? []), `post:${p.id}`]);
	}
	const cats = CATEGORY_ORDER.filter((c) => lab.some((l) => l.category === c));
	const catX = new Map<DemoCategory, number>();
	cats.forEach((c, j) => {
		const base = 420 + (j * (WIDE.w - 840)) / Math.max(1, cats.length - 1);
		const xs = lab.filter((l) => l.category === c).flatMap((l) => (usesByComp.get(l.title) ?? []).map((id) => pos.get(id)!.x));
		catX.set(c, 0.7 * base + 0.3 * (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : base));
	});
	const byX = [...cats].sort((a, b) => catX.get(a)! - catX.get(b)!);
	byX.forEach((c, j) => {
		if (j && catX.get(c)! - catX.get(byX[j - 1])! < 430) catX.set(c, catX.get(byX[j - 1])! + 430);
	});
	const meanX = [...catX.values()].reduce((a, b) => a + b, 0) / Math.max(1, catX.size);
	const shift = WIDE.w / 2 - meanX;
	const islands = new Map<DemoCategory, MapIsland>();
	const tallSlots = [
		[370, 2500],
		[760, 2500],
		[1150, 2500],
		[560, 2850],
		[960, 2850],
	];
	const golden = Math.PI * (3 - Math.sqrt(5));
	cats.forEach((c, j) => {
		const cx = catX.get(c)! + shift;
		const cy = 1110 + (j % 2 ? 28 : -22);
		const [tx, ty] = tallSlots[j % tallSlots.length];
		islands.set(c, { x: r1(cx), y: r1(cy), px: tx, py: ty, h: 260, s: 210 });
		lab.filter((l) => l.category === c).forEach((it, k) => {
			const r = 34 + 42 * Math.sqrt(k + 0.6);
			const rt = 28 + 34 * Math.sqrt(k + 0.6);
			const a = k * golden + j;
			set(`lab:${it.slug}`, cx + r * Math.cos(a) * 1.35, cy + r * Math.sin(a) * 0.72, tx + rt * Math.cos(a) * 1.28, ty + rt * Math.sin(a) * 0.8);
		});
	});

	// Terms: which modules use each glossary term. The module that glosses a term
	// with <Term name="..."> owns it; after that, modules whose prose names it by a
	// specific match key (headwordVariants). Counting runs over readable text only.
	const bodies = new Map(modules.map((m) => [baseSlug(m.id), readableText(`${(m.data.summary ?? []).join(' ')} ${m.data.description} ${m.body ?? ''}`)]));
	const glossed = new Map(
		modules.map((m) => [
			baseSlug(m.id),
			new Set([...(m.body ?? '').matchAll(/<Term\s+name="([^"]+)"/g)].map((x) => findTerm(x[1])?.slug ?? '').filter(Boolean)),
		]),
	);
	const termPrimary = new Map<string, { modules: string[]; keyword: boolean }>();
	for (const g of GLOSSARY) {
		const keys = TERM_KEYS[g.slug]?.map((v) => ({ v, cs: false })) ?? headwordVariants(g.term);
		// "batch invariance" also matches "batch-invariance"
		const res = keys.map(({ v, cs }) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(v).replace(/[ -]/g, '[\\s-]')}(?![\\p{L}\\p{N}])`, cs ? 'gu' : 'giu'));
		const counts = new Map<string, number>();
		for (const [slug, body] of bodies) {
			let n = res.reduce((s, re) => s + (body.match(re)?.length ?? 0), 0);
			// a gloss is the author saying "this is where the term lives"
			if (glossed.get(slug)?.has(g.slug)) n += 1000;
			if (n) counts.set(slug, n);
		}
		const owner = TERM_OWNER[g.slug];
		if (owner) counts.set(owner, (counts.get(owner) ?? 0) + 10_000);
		let keyword = false;
		let ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
		if (!ranked.length && !owner) {
			// Nothing names the headword: place it by its most specific words, and say so on its card.
			keyword = true;
			const sig = (g.term.match(/[A-Za-z][A-Za-z-]+/g) ?? []).filter((w) => w.length >= 6 && !TERM_STOP.has(w.toLowerCase()));
			const kw = new Map<string, number>();
			for (const [slug, body] of bodies) {
				const n = sig.reduce((s, w) => s + (body.match(new RegExp(`(?<![\\p{L}])${escapeRe(w)}`, 'giu'))?.length ?? 0), 0);
				if (n) kw.set(slug, n);
			}
			ranked = [...kw.entries()].sort((a, b) => b[1] - a[1]).slice(0, 1).map(([s]) => s);
		}
		termPrimary.set(g.slug, { modules: ranked, keyword });
	}
	const orbit = new Map<string, number>();
	for (const g of GLOSSARY) {
		const prim = termPrimary.get(g.slug)!.modules[0];
		const id = `term:${g.slug}`;
		if (!prim) {
			const k = orbit.get('') ?? 0;
			orbit.set('', k + 1);
			set(id, 400 + ((k * 211) % (WIDE.w - 800)), 880 + (k % 3) * 18, 200 + ((k * 137) % (TALL.w - 400)), 2290 + (k % 3) * 16);
			continue;
		}
		const k = orbit.get(prim) ?? 0;
		orbit.set(prim, k + 1);
		const c = pos.get(`module:${prim}`)!;
		const r = 54 + 17 * Math.sqrt(k + 1);
		const a = k * 2.39996 + ([...prim].reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7);
		set(id, c.x + r * Math.cos(a) * 1.05, c.y + r * Math.sin(a) * 0.95, c.px + r * 0.82 * Math.cos(a), c.py + r * 0.74 * Math.sin(a));
	}

	return { pos, islands, termPrimary, labOrder: lab };
}

/* ------------------------------------------------------------------ per-language graph */

const cache = new Map<Lang, Promise<MapGraph>>();

export function buildContentMap(lang: Lang): Promise<MapGraph> {
	if (!cache.has(lang)) cache.set(lang, build(lang));
	return cache.get(lang)!;
}

function boundsOf(points: [number, number][], pad: { x: number; top: number; bottom: number }): Bounds {
	let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
	for (const [x, y] of points) {
		x0 = Math.min(x0, x);
		y0 = Math.min(y0, y);
		x1 = Math.max(x1, x);
		y1 = Math.max(y1, y);
	}
	return { x0: Math.round(x0 - pad.x), y0: Math.round(y0 - pad.top), x1: Math.round(x1 + pad.x), y1: Math.round(y1 + pad.bottom) };
}

async function build(lang: Lang): Promise<MapGraph> {
	if (!structurePromise) structurePromise = buildStructure();
	const S = await structurePromise;
	const es = lang === 'es';
	const P = (id: string) => S.pos.get(id);

	const posts: Post[] = (await getCollection('blog'))
		.filter((p) => p.data.lang === lang && !p.data.draft)
		.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
	const modules: Module[] = (await getCollection('learn'))
		.filter((m) => (m.data.lang ?? 'en') === lang)
		.sort((a, b) => a.data.order - b.data.order);
	const lab = S.labOrder;
	const labBySlug = new Map(lab.map((l) => [l.slug, l]));
	const labByTitle = new Map(lab.map((l) => [l.title, l]));

	const nodes: MapNode[] = [];
	const edges: MapEdge[] = [];
	const ids = new Set<string>();
	const add = (n: MapNode) => {
		nodes.push(n);
		ids.add(n.id);
	};

	for (const p of posts) {
		const slug = baseSlug(p.id);
		const at = P(`post:${slug}`);
		if (!at) continue; // an ES-only post without an EN twin has no shared position
		const words = proseWords(p.body);
		add({
			id: `post:${slug}`,
			type: 'post',
			slug,
			title: p.data.title,
			short: shortTitle(p.data.title),
			desc: p.data.description,
			href: `/blog/${p.id}/`,
			date: iso(p.data.pubDate),
			minutes: readingMinutes(p.body),
			words,
			...at,
			h: words,
			s: 120,
		});
	}
	for (const m of modules) {
		const slug = baseSlug(m.id);
		const at = P(`module:${slug}`)!;
		const grades = { A: 0, B: 0, C: 0, D: 0 };
		for (const s of m.data.sources ?? []) grades[s.grade]++;
		const words = proseWords(m.body);
		add({
			id: `module:${slug}`,
			type: 'module',
			slug,
			title: m.data.title,
			short: MODULE_SHORT[slug]?.[lang] ?? shortTitle(m.data.title),
			desc: m.data.summary?.[0] ?? m.data.description,
			href: moduleHref(slug, lang),
			order: m.data.order,
			phase: m.data.phase,
			minutes: readingMinutes(m.body),
			words,
			sources: m.data.sources?.length ?? 0,
			grades,
			...at,
			h: words,
			s: 150,
		});
	}

	// Edges from the real references in this language's sources.
	const E = (s: string, t: string, k: MapEdge['k']) => {
		if (ids.has(s) && ids.has(t) && s !== t && !edges.some((e) => e.s === s && e.t === t && e.k === k)) edges.push({ s, t, k });
	};
	const usedBy = new Map<string, number>();
	const postUses = new Map<string, string[]>();
	for (const p of posts) {
		const id = `post:${baseSlug(p.id)}`;
		for (const c of moduleLinksOf(p.body)) E(id, `module:${c}`, 'cites');
		for (const l of postLinksOf(p.body)) E(id, `post:${l}`, 'links');
		const comps = uniq([
			...LAYOUT_COMPONENTS,
			...importsOf(p.body),
			...labLinksOf(p.body).map((s) => labBySlug.get(s)?.title ?? ''),
		]).filter((c) => labByTitle.has(c));
		for (const c of comps) usedBy.set(c, (usedBy.get(c) ?? 0) + 1);
		postUses.set(id, comps); // lab nodes are added below
	}

	for (const it of lab) {
		const at = P(`lab:${it.slug}`)!;
		add({
			id: `lab:${it.slug}`,
			type: 'lab',
			slug: it.slug,
			title: it.title,
			short: it.title,
			desc: it.summary[lang] ?? it.summary.en,
			href: es ? `/es/lab/${it.slug}/` : `/lab/${it.slug}/`,
			category: it.category,
			status: it.status,
			usedBy: usedBy.get(it.title) ?? 0,
			...at,
			h: it.whyLen / 2.2 + 60,
			s: 70,
		});
	}
	for (const [id, comps] of postUses) for (const c of comps) E(id, `lab:${labByTitle.get(c)!.slug}`, 'uses');

	for (let i = 0; i + 1 < modules.length; i++) E(`module:${baseSlug(modules[i].id)}`, `module:${baseSlug(modules[i + 1].id)}`, 'trail');
	for (const m of modules) {
		const id = `module:${baseSlug(m.id)}`;
		for (const c of moduleLinksOf(m.body)) E(id, `module:${c}`, 'links');
		for (const c of importsOf(m.body)) if (labByTitle.has(c)) E(id, `lab:${labByTitle.get(c)!.slug}`, 'uses-m');
	}

	for (const g of GLOSSARY) {
		const tp = S.termPrimary.get(g.slug)!;
		const at = P(`term:${g.slug}`)!;
		add({
			id: `term:${g.slug}`,
			type: 'term',
			slug: g.slug,
			title: g.term,
			short: g.term,
			desc: g.def[lang],
			href: `${es ? '/es' : ''}/learn/agentic-systems/glossary/#${g.slug}`,
			keyword: tp.keyword,
			modules: tp.modules.slice(0, 8),
			...at,
			h: 70,
			s: 44,
		});
		tp.modules.slice(0, 3).forEach((ms, k) => E(`module:${ms}`, `term:${g.slug}`, k === 0 ? 'term' : 'term2'));
	}

	// Tags: tiny labels on the north fringe above the essays that carry them.
	const tagPosts = new Map<string, string[]>();
	for (const p of posts) for (const t of p.data.tags ?? []) tagPosts.set(t, [...(tagPosts.get(t) ?? []), `post:${baseSlug(p.id)}`]);
	const tagList = [...tagPosts.entries()]
		.map(([t, pids]) => {
			const ps = pids.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean);
			return { t, pids, mx: ps.reduce((s, n) => s + n.x, 0) / ps.length, mpx: ps.reduce((s, n) => s + n.px + n.py / 10, 0) / ps.length };
		})
		.sort((a, b) => a.mx - b.mx);
	const xs = tagList.map((t) => t.mx);
	for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + 108);
	const off = WIDE.w / 2 - (xs[0] + xs[xs.length - 1]) / 2;
	const tallSorted = [...tagList].sort((a, b) => a.mpx - b.mpx);
	const perRow = Math.ceil(tallSorted.length / 3);
	tagList.forEach((tg, i) => {
		const ti = tallSorted.indexOf(tg);
		const row = Math.floor(ti / perRow);
		const inRow = Math.min(perRow, tallSorted.length - row * perRow);
		const col = ti % perRow;
		const px = 150 + ((col + 0.5) / inRow) * (TALL.w - 300);
		add({
			id: `tag:${tg.t}`,
			type: 'tag',
			slug: tg.t,
			title: `#${tg.t}`,
			short: `#${tg.t}`,
			count: tg.pids.length,
			x: r1(xs[i] + off),
			y: 92 + (i % 2 ? 30 : 0),
			px: r1(px),
			py: 96 + row * 52,
			h: 0,
			s: 0,
		});
		for (const pid of tg.pids) E(pid, `tag:${tg.t}`, 'tag');
	});

	// Marks: phases (river names along the ridge) and lab shelves.
	const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
	const phases: MapMark[] = PHASES.filter((p) => modules.some((m) => m.data.phase === p.phase)).map((p) => {
		const ms = nodes.filter((n) => n.type === 'module' && n.phase === p.phase);
		return {
			key: String(p.phase),
			eyebrow: `${es ? 'Fase' : 'Phase'} ${String(p.phase).padStart(2, '0')}`,
			label: p.title[lang],
			x: r1(mean(ms.map((m) => m.x))),
			y: 942,
			px: r1(mean(ms.map((m) => m.px))),
			py: r1(Math.max(...ms.map((m) => m.py)) + 92),
		};
	});
	const catLabels = es ? CATEGORY_LABELS_ES : CATEGORY_LABELS;
	const categories: MapMark[] = [...S.islands.entries()].map(([c, isl], j) => {
		const items = lab.filter((l) => l.category === c);
		// the label hangs below the shelf's lowest diamond (top-anchored), never among them
		const lowest = Math.max(...items.map((l) => P(`lab:${l.slug}`)!.py));
		const lowestW = Math.max(...items.map((l) => P(`lab:${l.slug}`)!.y));
		return {
			key: c,
			label: catLabels[c],
			short: catLabels[c].split(/ & | y /)[0],
			count: items.length,
			x: isl.x,
			// every other shelf name sits a line lower, so long neighbours never touch
			y: r1(lowestW + 30 + (j % 2 ? 40 : 0)),
			px: isl.px,
			py: r1(lowest + 60),
		};
	});

	const byType = (t: MapNode['type']) => nodes.filter((n) => n.type === t);
	const regions: MapGraph['regions'] = (['writing', 'course', 'lab'] as const).map((key) => {
		const ns = byType(key === 'writing' ? 'post' : key === 'course' ? 'module' : 'lab');
		return { key, label: REGION_LABEL[key][lang], y: r1(mean(ns.map((n) => n.y))), py: r1(mean(ns.map((n) => n.py))) };
	});

	const framed = nodes.filter((n) => n.type === 'post' || n.type === 'module' || n.type === 'lab');
	const bounds = {
		wide: boundsOf([...framed.map((n) => [n.x, n.y] as [number, number]), ...categories.map((c) => [c.x, c.y] as [number, number])], {
			x: 170,
			// room for a three-line essay title (plus its date line) above the northern row
			top: 280,
			bottom: 70,
		}),
		tall: boundsOf([...framed.map((n) => [n.px, n.py] as [number, number]), ...categories.map((c) => [c.px, c.py] as [number, number])], {
			x: 130,
			top: 140,
			bottom: 120,
		}),
	};

	const postNodes = byType('post');
	const moduleNodes = byType('module');
	return {
		lang,
		world: { wide: WIDE, tall: TALL },
		bounds,
		stats: {
			posts: postNodes.length,
			modules: moduleNodes.length,
			lab: byType('lab').length,
			terms: byType('term').length,
			tags: byType('tag').length,
			phases: phases.length,
			categories: categories.length,
			edges: edges.length,
			sources: moduleNodes.reduce((s, m) => s + (m.sources ?? 0), 0),
			wordsPosts: postNodes.reduce((s, n) => s + (n.words ?? 0), 0),
			wordsCourse: moduleNodes.reduce((s, n) => s + (n.words ?? 0), 0),
			firstPost: postNodes[0]?.date ?? '',
			lastPost: postNodes[postNodes.length - 1]?.date ?? '',
		},
		nodes,
		edges,
		phases,
		categories,
		regions,
		islands: [...S.islands.values()],
	};
}
