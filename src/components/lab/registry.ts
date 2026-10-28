/**
 * Lab registry — shared types + helpers for the /lab component gallery.
 *
 * Each demo file (src/components/lab/demos/<Name>.demo.astro) exports a
 * `meta: DemoMeta` from its frontmatter. The pages glob the demos and use
 * this module to derive slugs and group them for navigation.
 */
/**
 * Hand-authored prop documentation, kept in each demo's `meta.props` for
 * maintainers (the props ARE the public API; writing them down is the review).
 * Not rendered on the public lab pages.
 */
export interface PropDoc {
	name: string;
	type: string;
	default?: string;
	description?: string;
}

export type DemoCategory = 'data' | 'narrative' | 'playful' | 'typographic' | 'utility';

export interface DemoMeta {
	/** Component name as used in MDX, e.g. "InteractiveChart". */
	title: string;
	category: DemoCategory;
	status?: 'stable' | 'experimental';
	/** One-liner shown on the gallery index card. */
	summary?: string;
	/** Spanish counterpart of `summary`. */
	summaryEs?: string;
	/** Why this component exists — editorial voice (EN). Written via /blog-writer. */
	why?: string;
	/** Spanish counterpart of `why`. */
	whyEs?: string;
	props?: PropDoc[];
}

export interface DemoEntry {
	slug: string;
	meta: DemoMeta;
	/** The demo page content (the .astro module's default export). */
	Component: any;
}

export const CATEGORY_ORDER: DemoCategory[] = ['data', 'narrative', 'playful', 'typographic', 'utility'];

export const CATEGORY_LABELS: Record<DemoCategory, string> = {
	data: 'Data & visualization',
	narrative: 'Narrative & scroll',
	playful: 'Playful & interactive',
	typographic: 'Typographic & editorial',
	utility: 'Utility & chrome',
};

export const CATEGORY_LABELS_ES: Record<DemoCategory, string> = {
	data: 'Datos y visualización',
	narrative: 'Narrativa y scroll',
	playful: 'Juego e interacción',
	typographic: 'Tipografía y editorial',
	utility: 'Utilidad y chrome',
};

/** Locale-aware accessors for the bilingual meta fields. */
export const summaryFor = (meta: DemoMeta, lang: 'en' | 'es') =>
	lang === 'es' ? (meta.summaryEs ?? meta.summary) : meta.summary;
export const whyFor = (meta: DemoMeta, lang: 'en' | 'es') =>
	lang === 'es' ? (meta.whyEs ?? meta.why) : meta.why;

/** "InteractiveChart.demo.astro" → "interactive-chart" */
export function slugFromPath(path: string): string {
	const file = path.split('/').pop() ?? path;
	return file
		.replace(/\.demo\.astro$/, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
}

export function buildEntries(modules: Record<string, any>): DemoEntry[] {
	return Object.entries(modules)
		.map(([path, mod]) => ({
			slug: slugFromPath(path),
			meta: mod.meta as DemoMeta,
			Component: mod.default,
		}))
		.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export function groupByCategory(entries: DemoEntry[], lang: 'en' | 'es' = 'en') {
	const labels = lang === 'es' ? CATEGORY_LABELS_ES : CATEGORY_LABELS;
	return CATEGORY_ORDER.map((category) => ({
		category,
		label: labels[category],
		items: entries.filter((e) => e.meta.category === category),
	})).filter((g) => g.items.length > 0);
}
