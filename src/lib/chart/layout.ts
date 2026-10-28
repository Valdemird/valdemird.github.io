/**
 * Build-time layout math for InteractiveChart.
 *
 * Runs in .astro frontmatter only (nothing here ships to the client). It
 * answers the questions a static SVG can't answer in CSS: how much room the
 * tick labels need, which x labels to thin so they don't collide, and where an
 * annotation can sit without leaving the plot or landing on another one.
 *
 * Text widths are estimated in `em` (Geist / Geist Mono average glyph width)
 * and multiplied by the largest font size the CSS can apply to that variant,
 * so every estimate is a worst case.
 */
import { linearScale } from './scales';

/** Average advance width per glyph, in em. Mono is exact; sans is a safe upper bound. */
const EM_PER_CHAR = { mono: 0.62, sans: 0.56 } as const;

export function textWidthEm(text: string, face: keyof typeof EM_PER_CHAR = 'mono'): number {
	return text.length * EM_PER_CHAR[face];
}

/** Nice upper bound for a bar axis anchored at 0, e.g. 90 → 100, 58 → 60. */
export function niceMax(values: number[]): number {
	const max = Math.max(0, ...values);
	if (max === 0) return 1;
	return linearScale([0, max], [0, 1]).domain[1];
}

/**
 * One SVG layout variant. The chart renders a wide and a narrow variant and
 * a container query shows whichever fits. On screen, text is counter-scaled
 * (the client writes `--u` = viewBox px per CSS px), so tick labels render at
 * a fixed 12px whatever the column width.
 *
 * The font maxima below are those fixed sizes divided by the smallest scale
 * each variant is ever drawn at (wide: a 480px container → ~440px SVG for a
 * 600-unit viewBox; narrow: a 288px container → ~256px SVG for 330 units).
 */
export interface Variant {
	key: 'wide' | 'narrow';
	w: number;
	h: number;
	/** Largest tick font size, in user units, the CSS can apply to this variant. */
	tickFontMax: number;
	/** Largest annotation font size, in user units. */
	noteFontMax: number;
}

/** On-screen text sizes, in CSS px (the SVG counter-scales to hold them). */
export const TEXT_PX = { tick: 12, threshold: 11, note: 13 } as const;

const WIDE_MIN_SCALE = 440 / 600;
const NARROW_MIN_SCALE = 256 / 330;

export const VARIANTS: Variant[] = [
	{
		key: 'wide',
		w: 600,
		h: 280,
		tickFontMax: TEXT_PX.tick / WIDE_MIN_SCALE,
		noteFontMax: TEXT_PX.note / WIDE_MIN_SCALE,
	},
	{
		key: 'narrow',
		w: 330,
		h: 250,
		tickFontMax: TEXT_PX.tick / NARROW_MIN_SCALE,
		noteFontMax: TEXT_PX.note / NARROW_MIN_SCALE,
	},
];

export interface Pad {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/** Plot padding sized so the widest y tick label fits at the largest font. */
export function plotPad(v: Variant, tickLabels: string[]): Pad {
	const widest = Math.max(1, ...tickLabels.map((t) => t.length));
	return {
		top: 18,
		right: v.key === 'wide' ? 20 : 14,
		bottom: Math.ceil(v.tickFontMax * 2.1),
		// label + a 0.6em gap to the plot edge
		left: Math.ceil((widest * EM_PER_CHAR.mono + 0.6) * v.tickFontMax),
	};
}

/**
 * Show every k-th category label so neighbours never overlap. The first and
 * last labels always stay; returns the indices to render.
 */
export function thinLabels(labels: string[], xs: number[], fontMax: number): Set<number> {
	const keep = new Set<number>();
	if (labels.length === 0) return keep;
	const gap = 0.9 * fontMax;
	let lastRight = -Infinity;
	labels.forEach((label, i) => {
		const half = (textWidthEm(label) * fontMax) / 2;
		const isLast = i === labels.length - 1;
		if (xs[i] - half >= lastRight + gap || i === 0) {
			keep.add(i);
			lastRight = xs[i] + half;
		} else if (isLast) {
			// Keep the final label; drop the previous one if they'd collide.
			const prev = Math.max(...keep);
			if (prev !== 0) keep.delete(prev);
			keep.add(i);
		}
	});
	return keep;
}

export interface PlacedNote {
	text: string;
	/** Anchor point (the data point). */
	cx: number;
	cy: number;
	/** Text position. */
	x: number;
	y: number;
	anchor: 'start' | 'middle' | 'end';
	/** Text grows up from the baseline (above) or down from a hanging edge (below). */
	side: 'above' | 'below';
	/** Leader line from the point to the text. */
	y1: number;
	y2: number;
	/**
	 * Set when no clear spot exists in the plot: the point gets this numbered
	 * marker and the note moves under the plot (the bar-chart idiom).
	 */
	footnote?: number;
}

interface NoteInput {
	text: string;
	cx: number;
	cy: number;
}

/** Marks a note must not cover: every series polyline, threshold and dot. */
export interface Obstacles {
	lines: [number, number][][];
	hlines: number[];
	dots: [number, number][];
}

export type Box = [number, number, number, number]; // left, top, right, bottom

function segmentHitsBox([x1, y1]: [number, number], [x2, y2]: [number, number], [l, t, r, b]: Box): boolean {
	if (Math.max(x1, x2) < l || Math.min(x1, x2) > r || Math.max(y1, y2) < t || Math.min(y1, y2) > b) return false;
	// Sample the segment; marks are short and boxes are text-sized, so 24
	// steps never skip across a box.
	for (let i = 0; i <= 24; i++) {
		const x = x1 + ((x2 - x1) * i) / 24;
		const y = y1 + ((y2 - y1) * i) / 24;
		if (x >= l && x <= r && y >= t && y <= b) return true;
	}
	return false;
}

/** True when any segment of any polyline crosses the box. */
export function boxHitsLines(box: Box, lines: [number, number][][], pad = 3): boolean {
	const padded: Box = [box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad];
	return lines.some((line) => line.some((pt, i) => i > 0 && segmentHitsBox(line[i - 1], pt, padded)));
}

function hitsObstacles(box: Box, obs: Obstacles, ownDot: [number, number]): boolean {
	const pad = 4;
	const padded: Box = [box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad];
	for (const line of obs.lines) {
		for (let i = 1; i < line.length; i++) if (segmentHitsBox(line[i - 1], line[i], padded)) return true;
	}
	for (const y of obs.hlines) if (y >= padded[1] && y <= padded[3]) return true;
	for (const [x, y] of obs.dots) {
		if (x === ownDot[0] && y === ownDot[1]) continue;
		if (x >= padded[0] - 5 && x <= padded[2] + 5 && y >= padded[1] - 5 && y <= padded[3] + 5) return true;
	}
	return false;
}

/**
 * Place point annotations inside the plot box, clear of every mark:
 *  - candidate spots go above and below the point, centred or hung to either
 *    side of it, stepping one line further out each round;
 *  - a spot must stay in the plot, miss every series line, threshold and dot,
 *    and miss notes placed before it;
 *  - when nothing is clear, the note becomes a numbered marker on the point
 *    with its text listed under the plot.
 */
export function placeNotes(notes: NoteInput[], v: Variant, pad: Pad, obs: Obstacles): PlacedNote[] {
	const font = v.noteFontMax;
	const lineH = font * 1.25;
	const leader = v.key === 'wide' ? 26 : 20;
	const plotL = pad.left;
	const plotR = v.w - pad.right;
	const plotT = pad.top;
	const plotB = v.h - pad.bottom;
	const placed: { note: PlacedNote; box: Box }[] = [];
	let footnotes = 0;

	for (const n of notes) {
		const width = textWidthEm(n.text, 'sans') * font;
		const own: [number, number] = [n.cx, n.cy];

		const anchors: { anchor: PlacedNote['anchor']; x: number }[] = [];
		if (n.cx - width / 2 >= plotL && n.cx + width / 2 <= plotR) anchors.push({ anchor: 'middle', x: n.cx });
		if (n.cx - 6 + width <= plotR) anchors.push({ anchor: 'start', x: Math.max(plotL, n.cx - 6) });
		if (n.cx + 6 - width >= plotL) anchors.push({ anchor: 'end', x: Math.min(plotR, n.cx + 6) });

		let chosen: { note: PlacedNote; box: Box } | null = null;
		search: for (let extra = 0; extra <= lineH * 3; extra += lineH) {
			for (const side of ['above', 'below'] as const) {
				for (const a of anchors) {
					const dist = leader + extra;
					const y = side === 'above' ? n.cy - dist : n.cy + dist;
					const top = side === 'above' ? y - lineH : y;
					const bottom = side === 'above' ? y + lineH * 0.25 : y + lineH;
					const left = a.anchor === 'start' ? a.x : a.anchor === 'end' ? a.x - width : a.x - width / 2;
					const box: Box = [left, top, left + width, bottom];
					if (top < plotT - 4 || bottom > plotB) continue;
					if (placed.some((p) => box[0] < p.box[2] && box[2] > p.box[0] && box[1] < p.box[3] && box[3] > p.box[1])) continue;
					if (hitsObstacles(box, obs, own)) continue;
					chosen = {
						box,
						note: {
							text: n.text,
							cx: n.cx,
							cy: n.cy,
							x: a.x,
							y,
							anchor: a.anchor,
							side,
							y1: side === 'above' ? n.cy - 9 : n.cy + 9,
							y2: side === 'above' ? y + 4 : y - 4,
						},
					};
					break search;
				}
			}
		}

		if (chosen) {
			placed.push(chosen);
			continue;
		}
		footnotes += 1;
		placed.push({
			box: [n.cx, n.cy, n.cx, n.cy],
			note: { text: n.text, cx: n.cx, cy: n.cy, x: n.cx, y: n.cy, anchor: 'middle', side: 'above', y1: n.cy, y2: n.cy, footnote: footnotes },
		});
	}
	return placed.map((p) => p.note);
}
