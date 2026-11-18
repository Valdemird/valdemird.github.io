// TimingDiagram's model: a time axis split into phases (floor, air…), events on
// it (the ledge ends), and windows a technique opens (coyote time). For any
// instant t it answers "what happens if you press now?", with the technique on
// and off. Shared by the component's server render and its client script.

export type Tone = 'solid' | 'air' | 'danger' | 'neutral';
export type WindowTone = 'a' | 'b' | 'c';

export interface Outcome {
	/** true: it works; false: it fails; null: nothing happens. */
	ok: boolean | null;
	/** May contain {ms}: the distance to the window's reference edge. */
	text: string;
}

export interface Phase {
	from: number;
	to: number;
	label: string;
	tone?: Tone;
	on: Outcome;
	/** Defaults to `on`: a phase behaves the same with the technique off. */
	off?: Outcome;
}

export interface TimingEvent {
	at: number;
	label: string;
}

export interface TimingWindow {
	from: number;
	to: number;
	label: string;
	/** Short figure shown next to the label, e.g. "100 ms". */
	detail?: string;
	tone?: WindowTone;
	/** {ms} counts from the window's start ("since") or up to its end ("until"). */
	measure?: 'since' | 'until';
	on: Outcome;
	off: Outcome;
}

export interface TimingConfig {
	duration: number;
	phases: Phase[];
	events?: TimingEvent[];
	windows?: TimingWindow[];
}

export interface Resolved {
	/** Index into windows, or -1. */
	window: number;
	/** Index into phases, or -1. */
	phase: number;
	on: Outcome;
	off: Outcome;
}

const NOTHING: Outcome = { ok: null, text: '' };

const fill = (o: Outcome, ms: number): Outcome => ({ ok: o.ok, text: o.text.replaceAll('{ms}', String(Math.round(ms))) });

/** What a press at `t` does. Windows win over phases; the last matching window wins. */
export function resolve(config: TimingConfig, t: number): Resolved {
	const windows = config.windows ?? [];
	const phase = config.phases.findIndex((p, i) => t >= p.from && (t < p.to || (i === config.phases.length - 1 && t <= p.to)));
	let window = -1;
	windows.forEach((w, i) => {
		if (t >= w.from && t <= w.to) window = i;
	});
	if (window >= 0) {
		const w = windows[window];
		const ms = w.measure === 'until' ? w.to - t : t - w.from;
		return { window, phase, on: fill(w.on, ms), off: fill(w.off, ms) };
	}
	const p = config.phases[phase];
	if (!p) return { window, phase, on: NOTHING, off: NOTHING };
	return { window, phase, on: fill(p.on, 0), off: fill(p.off ?? p.on, 0) };
}

/** Percentage along the axis. */
export const pct = (config: TimingConfig, t: number) => `${(Math.min(Math.max(t, 0), config.duration) / config.duration) * 100}%`;
