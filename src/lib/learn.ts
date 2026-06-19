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

/** Public URL for a module in a given language. */
export function moduleHref(slug: string, lang: Lang): string {
	return lang === 'es' ? `/es/learn/${slug}/` : `/learn/${slug}/`;
}

export function learnHomeHref(lang: Lang): string {
	return lang === 'es' ? '/es/learn/' : '/learn/';
}

/** Previous / next module in reading order, for the footer pager. */
export function getPrevNext(modules: LearnEntry[], currentSlug: string) {
	const idx = modules.findIndex((m) => baseSlug(m.id) === currentSlug);
	return {
		prev: idx > 0 ? modules[idx - 1] : null,
		next: idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null,
	};
}
