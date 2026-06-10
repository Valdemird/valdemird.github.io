/**
 * Build-time chart scales — thin wrappers over d3-scale.
 *
 * These run in .astro frontmatter during the static build; no d3 code ships
 * to the client. Output is plain numbers baked into the SVG markup, which
 * keeps fills/strokes on CSS variables (OKLch theming stays free).
 */
import { scaleLinear } from 'd3-scale';

export interface ValueScale {
	/** Map a data value to a pixel position. */
	(v: number): number;
	/** Nice tick values for gridlines/labels. */
	ticks: number[];
	domain: [number, number];
}

/**
 * Linear scale with "nice" rounded bounds and human tick values.
 * `range` is [pixelStart, pixelEnd] — pass [bottom, top] for a y-axis.
 */
export function linearScale(
	domain: [number, number],
	range: [number, number],
	tickCount = 4,
): ValueScale {
	const [d0, d1] = domain[0] === domain[1] ? [domain[0] - 1, domain[1] + 1] : domain;
	const s = scaleLinear().domain([d0, d1]).range(range).nice(tickCount);
	const fn = ((v: number) => s(v)) as ValueScale;
	fn.ticks = s.ticks(tickCount);
	fn.domain = s.domain() as [number, number];
	return fn;
}

/** Evenly-spaced x positions for categorical/ordinal series. */
export function pointPositions(count: number, x0: number, x1: number): number[] {
	if (count <= 1) return [x0 + (x1 - x0) / 2];
	return Array.from({ length: count }, (_, i) => x0 + (i / (count - 1)) * (x1 - x0));
}

/** Y-domain across one or more series, anchored at 0 unless data dips below. */
export function valueDomain(values: number[]): [number, number] {
	const max = Math.max(...values);
	const min = Math.min(...values);
	return [Math.min(0, min), max];
}

/** Compact tick label: 1200 → "1.2k", 0.5 → "0.5". */
export function formatTick(v: number): string {
	if (Math.abs(v) >= 1000) {
		const k = v / 1000;
		return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
	}
	return `${Math.round(v * 100) / 100}`;
}
