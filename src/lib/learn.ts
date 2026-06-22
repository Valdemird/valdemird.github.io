import { getCollection, type CollectionEntry } from 'astro:content';

export type LearnEntry = CollectionEntry<'learn'>;
export type Lang = 'en' | 'es';

/**
 * The 8-phase learning path. Phase titles are bilingual; the module order and
 * grouping live in the content frontmatter (`phase`, `order`). This is the only
 * place phase copy is authored — the sidebar, hub, and breadcrumbs read it.
 */
export const PHASES: { phase: number; title: { en: string; es: string } }[] = [
	{ phase: 1, title: { en: 'The substrate and the unifying mental model', es: 'El sustrato y el modelo mental unificador' } },
	{ phase: 2, title: { en: 'The two atoms of composition: context and tools', es: 'Los dos átomos de composición: contexto y tools' } },
	{ phase: 3, title: { en: 'The control loop and knowledge retrieval', es: 'El bucle de control y la recuperación' } },
	{ phase: 4, title: { en: 'Durable memory and state across turns', es: 'Memoria durable y estado entre turnos' } },
	{ phase: 5, title: { en: 'Reliability: human control, security, evaluation', es: 'Fiabilidad: control humano, seguridad y evaluación' } },
	{ phase: 6, title: { en: 'Reasoning as budgetable compute', es: 'Razonamiento como cómputo presupuestable' } },
	{ phase: 7, title: { en: 'Production: observability and durable systems', es: 'Producción: observabilidad y sistemas durables' } },
	{ phase: 8, title: { en: 'Frontier: multi-agent, post-training, the future', es: 'Frontera: multi-agente, post-training y el futuro' } },
];

export const TIER_LABEL: Record<string, { en: string; es: string }> = {
	fundamento: { en: 'Foundation', es: 'Fundamento' },
	core: { en: 'Core', es: 'Core' },
	fiabilidad: { en: 'Reliability', es: 'Fiabilidad' },
	produccion: { en: 'Production', es: 'Producción' },
	frontera: { en: 'Frontier', es: 'Frontera' },
};

export const DURABILITY_LABEL: Record<string, { en: string; es: string }> = {
	atemporal: { en: 'timeless', es: 'atemporal' },
	duradero: { en: 'durable', es: 'duradero' },
	efimero: { en: 'fast-moving', es: 'efímero' },
};

export const GRADE_LABEL: Record<string, { en: string; es: string }> = {
	A: { en: 'High-confidence primary source', es: 'Fuente primaria de alta credibilidad' },
	B: { en: 'Solid source', es: 'Fuente sólida' },
	C: { en: 'Emerging / partial', es: 'Emergente / parcial' },
	D: { en: "Author's inference (unverified)", es: 'Inferencia del autor (no verificada)' },
};

/** Strip the `es/` id prefix so EN and ES entries share one slug for pairing. */
export function baseSlug(id: string): string {
	return id.replace(/^es\//, '');
}

/** All learn entries for one language, sorted by global reading order. */
export async function getLearnModules(lang: Lang): Promise<LearnEntry[]> {
	const all = await getCollection('learn');
	return all
		.filter((m) => (m.data.lang ?? 'en') === lang)
		.sort((a, b) => a.data.order - b.data.order);
}

/** Group the ordered modules by phase for the sidebar / hub. */
export function groupByPhase(modules: LearnEntry[]) {
	return PHASES.map((p) => ({
		...p,
		modules: modules.filter((m) => m.data.phase === p.phase).sort((a, b) => a.data.order - b.data.order),
	})).filter((p) => p.modules.length > 0);
}

/**
 * URL slug that namespaces this course under the `/learn/` topic directory.
 * `/learn/` is the directory of learning tracks; this course lives at
 * `/learn/agentic-systems/`, leaving room for future topics.
 */
export const COURSE_SLUG = 'agentic-systems';

/** Public URL for a module in a given language. */
export function moduleHref(slug: string, lang: Lang): string {
	return lang === 'es' ? `/es/learn/${COURSE_SLUG}/${slug}/` : `/learn/${COURSE_SLUG}/${slug}/`;
}

/** The `/learn/` topic directory (lists every learning track). */
export function learnHomeHref(lang: Lang): string {
	return lang === 'es' ? '/es/learn/' : '/learn/';
}

/** This course's hub page, `/learn/agentic-systems/`. */
export function courseHomeHref(lang: Lang): string {
	return lang === 'es' ? `/es/learn/${COURSE_SLUG}/` : `/learn/${COURSE_SLUG}/`;
}

/**
 * Aggregate "how much data is in here" stats for one language, computed at
 * build time. Powers the deep-dive metrics on the blog card and the hub hero.
 */
export interface LearnStats {
	modules: number;
	phases: number;
	words: number;
	readingMinutes: number;
	sources: number;
}

export async function getLearnStats(lang: Lang): Promise<LearnStats> {
	const modules = await getLearnModules(lang);
	const words = modules.reduce((sum, m) => {
		const tokens = (m.body ?? '').trim().split(/\s+/).filter(Boolean);
		return sum + tokens.length;
	}, 0);
	const sources = modules.reduce((sum, m) => sum + (m.data.sources?.length ?? 0), 0);
	return {
		modules: modules.length,
		phases: groupByPhase(modules).length,
		words,
		readingMinutes: Math.max(1, Math.round(words / 200)),
		sources,
	};
}

/**
 * Estimated reading time in minutes for one module's MDX body. Strips import
 * lines and JSX/HTML tags so component markup doesn't inflate the count, then
 * assumes ~200 wpm. Used in the module header so learners can budget the read.
 */
export function readingMinutes(body: string | undefined): number {
	const text = (body ?? '')
		.replace(/^import .*$/gm, '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ');
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

/** Previous / next module in reading order, for the footer pager. */
export function getPrevNext(modules: LearnEntry[], currentSlug: string) {
	const idx = modules.findIndex((m) => baseSlug(m.id) === currentSlug);
	return {
		prev: idx > 0 ? modules[idx - 1] : null,
		next: idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null,
	};
}
