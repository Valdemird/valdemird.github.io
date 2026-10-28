/**
 * Client-side chart interactivity, shared by every SVG chart type.
 *
 * Wires three behaviors onto figures marked `data-chart-interactive`:
 *   1. Hover scrub — a crosshair snaps to the nearest x position (scatter:
 *      the nearest point in 2D) and a floating readout shows every visible
 *      series' value there, parked in an empty band so it covers no line.
 *      On touch, a tap pins the readout until a tap outside the chart.
 *   2. Keyboard navigation — the SVG is focusable; ←/→ move the active
 *      point, Home/End jump, the readout follows and an aria-live region
 *      announces values.
 *   3. Legend toggling — `[data-series-toggle]` buttons hide/show their
 *      series group and update aria-pressed.
 *
 * Each figure may carry two SVGs (wide and narrow layout variants, one
 * hidden by a container query); every variant gets its own crosshair and
 * handlers, and they share one readout and one aria-live region.
 *
 * Dependency-free on purpose: d3 stays build-time only. Idempotent and
 * astro:after-swap-safe via the `data-interact-ready` guard (the lab's
 * replay button strips `*-ready` guards to re-run setup).
 */

interface PointInfo {
	x: number; // SVG user-space x
	y: number;
	label: string;
	value: string;
	series: string;
	el: SVGGraphicsElement;
}

function collectPoints(svg: SVGSVGElement): PointInfo[] {
	return Array.from(svg.querySelectorAll<SVGGraphicsElement>('[data-pt]')).map((el) => ({
		x: Number(el.getAttribute('cx') ?? el.getAttribute('data-x') ?? 0),
		y: Number(el.getAttribute('cy') ?? el.getAttribute('data-y') ?? 0),
		label: el.getAttribute('data-label') ?? '',
		value: el.getAttribute('data-value') ?? '',
		series: el.getAttribute('data-series') ?? '',
		el,
	}));
}

function visiblePoints(points: PointInfo[]): PointInfo[] {
	return points.filter((p) => !p.el.closest('.series-hidden'));
}

/** Distinct x positions, ascending — the scrub snaps between these. */
function xStops(points: PointInfo[]): number[] {
	return [...new Set(points.map((p) => p.x))].sort((a, b) => a - b);
}

function nearestStop(stops: number[], x: number): number {
	let best = stops[0];
	let dist = Infinity;
	for (const s of stops) {
		const d = Math.abs(s - x);
		if (d < dist) {
			dist = d;
			best = s;
		}
	}
	return best;
}

/** CSS-px box of the plot area, relative to the chart body. */
interface Frame {
	left: number;
	top: number;
	bottom: number;
	scaleX: number;
	scaleY: number;
}

/**
 * Choose where the readout goes so it covers no data: beside the crosshair
 * (right side first), at the height of the largest empty band between the
 * visible series inside the readout's horizontal span. Lines are sampled at
 * the dots that fall in or next to that span, joined linearly.
 */
function placeTip(
	tip: HTMLElement,
	bodyWidth: number,
	frame: Frame,
	cssX: number,
	series: PointInfo[][],
	svgTop: number,
	labels: [number, number, number, number][] = [],
	gap = 12,
): { left: number; top: number; side: 'left' | 'right' } {
	const w = tip.offsetWidth;
	const h = tip.offsetHeight;
	const margin = 6;
	const toY = (y: number) => svgTop + y * frame.scaleY;
	const toX = (x: number) => frame.left + x * frame.scaleX;

	const occupied = (x0: number, x1: number): [number, number][] => {
		const spans: [number, number][] = [];
		for (const pts of series) {
			if (pts.length === 0) continue;
			const xs = pts.map((p) => toX(p.x));
			const ys = pts.map((p) => toY(p.y));
			let lo = Infinity;
			let hi = -Infinity;
			const take = (y: number) => {
				lo = Math.min(lo, y);
				hi = Math.max(hi, y);
			};
			const at = (x: number) => {
				for (let i = 1; i < xs.length; i++) {
					if (x >= xs[i - 1] && x <= xs[i]) {
						const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1] || 1);
						return ys[i - 1] + (ys[i] - ys[i - 1]) * t;
					}
				}
				return null;
			};
			for (const x of [x0, x1]) {
				const y = at(x);
				if (y !== null) take(y);
			}
			xs.forEach((x, i) => {
				if (x >= x0 && x <= x1) take(ys[i]);
			});
			if (lo <= hi) spans.push([lo - margin - 4, hi + margin + 4]);
		}
		// Annotation and callout labels count as data too.
		for (const [l, t, r, b] of labels) {
			if (r >= x0 && l <= x1) spans.push([t - 4, b + 4]);
		}
		return spans.sort((a, b) => a[0] - b[0]);
	};

	// Free vertical bands of the plot inside [x0, x1]; the tip takes the
	// roomiest one it fits in (or, if none fits, the roomiest overall).
	const bestTop = (x0: number, x1: number): { top: number; clear: boolean; room: number } => {
		const bands: [number, number][] = [];
		let cursor = frame.top;
		for (const [a, b] of occupied(x0, x1)) {
			if (a > cursor) bands.push([cursor, a]);
			cursor = Math.max(cursor, b);
		}
		if (frame.bottom > cursor) bands.push([cursor, frame.bottom]);
		if (bands.length === 0) return { top: frame.top, clear: false, room: 0 };
		const [from, to] = bands.reduce((best, band) => (band[1] - band[0] > best[1] - best[0] ? band : best));
		const room = to - from;
		const top = room > h ? from + Math.min(8, (room - h) / 2) : from;
		return { top: Math.max(frame.top, Math.min(frame.bottom - h, top)), clear: room >= h, room };
	};

	const rightLeft = cssX + gap;
	const leftLeft = cssX - gap - w;
	const options: { left: number; side: 'left' | 'right' }[] = [];
	if (rightLeft + w <= bodyWidth - 4) options.push({ left: rightLeft, side: 'right' });
	if (leftLeft >= 4) options.push({ left: leftLeft, side: 'left' });
	if (options.length === 0) options.push({ left: Math.max(4, Math.min(bodyWidth - w - 4, rightLeft)), side: 'right' });

	let pick = { left: options[0].left, side: options[0].side, ...bestTop(Math.min(cssX, options[0].left), Math.max(cssX, options[0].left + w)) };
	for (const o of options.slice(1)) {
		if (pick.clear) break;
		const t = bestTop(Math.min(cssX, o.left), Math.max(cssX, o.left + w));
		if (t.clear || t.room > pick.room) pick = { left: o.left, side: o.side, ...t };
	}
	return { left: pick.left, top: pick.top, side: pick.side };
}

function setupFigure(figure: HTMLElement) {
	const body = figure.querySelector<HTMLElement>('.chart-body');
	// One SVG per layout variant (wide / narrow); a container query shows one.
	const svgs = Array.from(figure.querySelectorAll<SVGSVGElement>('svg.chart-svg'));
	if (!body || svgs.length === 0) return;
	const isScatter = figure.dataset.chartType === 'scatter';
	const xUnit = figure.dataset.xUnit ?? '';
	const xAxis = figure.dataset.xAxis ?? '';
	const yAxis = figure.dataset.yAxis ?? '';

	// Re-init (lab replay strips the guard): remove anything we created before.
	figure.querySelectorAll('.chart-cross, .chart-cross-h').forEach((el) => el.remove());
	body.querySelectorAll('.chart-tip, .sr-only-chart').forEach((el) => el.remove());

	// Readout + live region are shared by every variant.
	const tip = document.createElement('div');
	tip.className = 'chart-tip';
	tip.setAttribute('hidden', '');
	body.appendChild(tip);

	const live = document.createElement('span');
	live.className = 'sr-only-chart';
	live.setAttribute('aria-live', 'polite');
	body.appendChild(live);

	const hideTip = () => tip.setAttribute('hidden', '');
	const hiders: (() => void)[] = [];
	const hideAll = () => {
		hideTip();
		for (const h of hiders) h();
	};

	for (const svg of svgs) {
		const allPoints = collectPoints(svg);
		if (allPoints.length === 0) continue;

		// --- Crosshair, created client-side so SSR markup stays clean ---
		const ns = 'http://www.w3.org/2000/svg';
		const vb = svg.viewBox.baseVal;
		const padTop = Number(svg.dataset.padTop ?? 16);
		const padBottom = Number(svg.dataset.padBottom ?? 40);
		const plotLeft = Number(svg.dataset.plotLeft ?? 0);
		const plotRight = Number(svg.dataset.plotRight ?? vb.width);
		const cross = document.createElementNS(ns, 'line');
		cross.setAttribute('class', 'chart-cross');
		cross.setAttribute('y1', String(padTop));
		cross.setAttribute('y2', String(vb.height - padBottom));
		cross.setAttribute('hidden', '');
		svg.appendChild(cross);
		// Scatter: a short horizontal tick too, so the cross marks one point.
		const crossH = document.createElementNS(ns, 'line');
		crossH.setAttribute('class', 'chart-cross-h');
		crossH.setAttribute('hidden', '');
		if (isScatter) svg.appendChild(crossH);

		const hide = () => {
			cross.setAttribute('hidden', '');
			crossH.setAttribute('hidden', '');
			for (const p of allPoints) p.el.classList.remove('pt-active');
		};
		hiders.push(hide);

		const bySeries = () => {
			const groups = new Map<string, PointInfo[]>();
			for (const p of visiblePoints(allPoints)) {
				const list = groups.get(p.series) ?? [];
				list.push(p);
				groups.set(p.series, list);
			}
			return [...groups.values()].map((l) => l.sort((a, b) => a.x - b.x));
		};

		const render = (pts: PointInfo[], stopX: number, announce: boolean) => {
			const first = pts[0];
			tip.innerHTML = '';
			const head = document.createElement('span');
			head.className = 'chart-tip-head';
			// "1 steps" → "1 step": drop a plural -s on the singular.
			const unitFor = (label: string) => (label === '1' && /s$/.test(xUnit) ? xUnit.slice(0, -1) : xUnit);
			head.textContent = `${first.label}${isScatter ? '' : unitFor(first.label)}`;
			tip.appendChild(head);
			for (const p of pts) {
				const row = document.createElement('span');
				row.className = 'chart-tip-row';
				if (isScatter) {
					// Both coordinates, one per row, named by their axes.
					const xs = p.el.getAttribute('data-x') ?? '';
					row.textContent = `${xs}${xAxis ? ` ${xAxis}` : ''}`;
					tip.appendChild(row);
					const rowY = document.createElement('span');
					rowY.className = 'chart-tip-row';
					rowY.textContent = `${p.value}${yAxis ? ` ${yAxis}` : ''}`;
					tip.appendChild(rowY);
					continue;
				} else if (p.series) {
					const sw = document.createElement('i');
					sw.className = 'chart-tip-swatch';
					sw.style.background = p.el.getAttribute('fill') ?? 'currentColor';
					const name = document.createElement('span');
					name.textContent = p.series;
					const val = document.createElement('b');
					val.textContent = p.value;
					row.append(sw, name, val);
				} else {
					row.textContent = p.value;
				}
				tip.appendChild(row);
			}
			tip.removeAttribute('hidden');

			const rect = svg.getBoundingClientRect();
			const bodyRect = body.getBoundingClientRect();
			// The readout may use the whole SVG height, tick labels included:
			// briefly covering an axis label beats covering a line.
			const frame: Frame = {
				left: rect.left - bodyRect.left,
				top: rect.top - bodyRect.top,
				bottom: rect.bottom - bodyRect.top,
				scaleX: rect.width / vb.width,
				scaleY: rect.height / vb.height,
			};
			const cssX = frame.left + stopX * frame.scaleX;
			// Scatter: every visible point is an obstacle on its own.
			const obstacles = isScatter ? visiblePoints(allPoints).map((p) => [p]) : bySeries();
			const labels = Array.from(
				svg.querySelectorAll<SVGGraphicsElement>('.chart-svg-annotation text, .chart-svg-callout, .chart-svg-footmark'),
				(el) => {
					const r = el.getBoundingClientRect();
					return [r.left - bodyRect.left, r.top - bodyRect.top, r.right - bodyRect.left, r.bottom - bodyRect.top] as [number, number, number, number];
				},
			);
			const pos = placeTip(tip, bodyRect.width, frame, cssX, obstacles, rect.top - bodyRect.top, labels);
			tip.style.left = `${pos.left}px`;
			tip.style.top = `${pos.top}px`;
			tip.dataset.side = pos.side;

			if (announce) {
				live.textContent = isScatter
					? `${first.label}: ${Array.from(tip.querySelectorAll('.chart-tip-row'), (r) => r.textContent).join(', ')}`
					: `${first.label}${unitFor(first.label)}: ${pts.map((p) => (p.series ? `${p.series} ${p.value}` : p.value)).join(', ')}`;
			}
		};

		const showAt = (stopX: number, announce = false) => {
			const pts = visiblePoints(allPoints).filter((p) => p.x === stopX);
			if (pts.length === 0) {
				hideAll();
				return;
			}
			cross.setAttribute('x1', String(stopX));
			cross.setAttribute('x2', String(stopX));
			cross.removeAttribute('hidden');
			for (const p of allPoints) p.el.classList.toggle('pt-active', p.x === stopX);
			render(pts, stopX, announce);
		};

		// Scatter snaps in 2D to one point, with a short cross through it.
		const showPoint = (p: PointInfo, announce = false) => {
			const arm = 14;
			cross.setAttribute('x1', String(p.x));
			cross.setAttribute('x2', String(p.x));
			cross.setAttribute('y1', String(Math.max(padTop, p.y - arm)));
			cross.setAttribute('y2', String(Math.min(vb.height - padBottom, p.y + arm)));
			crossH.setAttribute('x1', String(Math.max(plotLeft, p.x - arm)));
			crossH.setAttribute('x2', String(Math.min(plotRight, p.x + arm)));
			crossH.setAttribute('y1', String(p.y));
			crossH.setAttribute('y2', String(p.y));
			cross.removeAttribute('hidden');
			crossH.removeAttribute('hidden');
			for (const q of allPoints) q.el.classList.toggle('pt-active', q === p);
			render([p], p.x, announce);
		};

		const toUser = (e: PointerEvent) => {
			const rect = svg.getBoundingClientRect();
			return {
				x: ((e.clientX - rect.left) / rect.width) * vb.width,
				y: ((e.clientY - rect.top) / rect.height) * vb.height,
			};
		};

		const scrubTo = (e: PointerEvent) => {
			const { x, y } = toUser(e);
			const visible = visiblePoints(allPoints);
			if (visible.length === 0) return;
			if (isScatter) {
				let best = visible[0];
				let dist = Infinity;
				for (const p of visible) {
					const d = (p.x - x) ** 2 + (p.y - y) ** 2;
					if (d < dist) {
						dist = d;
						best = p;
					}
				}
				showPoint(best);
				return;
			}
			showAt(nearestStop(xStops(visible), x));
		};

		// Handler properties (not addEventListener) so a re-init replaces the old
		// handlers instead of stacking duplicates on the same DOM.
		// Mouse/pen hover scrubs; a touch tap pins the readout at the tapped x
		// until the next tap outside the chart (pointerleave fires right after
		// a touch ends, so it must not hide a tapped readout).
		svg.onpointermove = (e) => {
			if (e.pointerType === 'touch') return;
			scrubTo(e);
		};
		svg.onpointerdown = (e) => {
			if (e.pointerType !== 'mouse') scrubTo(e);
		};
		svg.onpointerleave = (e) => {
			if (e.pointerType === 'mouse') hideAll();
		};

		// --- Keyboard navigation ---
		let activeIdx = -1;
		svg.setAttribute('tabindex', '0');
		svg.onkeydown = (e) => {
			const visible = visiblePoints(allPoints);
			const stops = isScatter ? [...visible].sort((a, b) => a.x - b.x || a.y - b.y) : xStops(visible);
			if (stops.length === 0) return;
			let next = activeIdx;
			if (e.key === 'ArrowRight') next = Math.min(activeIdx + 1, stops.length - 1);
			else if (e.key === 'ArrowLeft') next = Math.max(activeIdx - 1, 0);
			else if (e.key === 'Home') next = 0;
			else if (e.key === 'End') next = stops.length - 1;
			else if (e.key === 'Escape') {
				activeIdx = -1;
				hideAll();
				return;
			} else return;
			e.preventDefault();
			activeIdx = next === -1 ? 0 : next;
			const stop = stops[activeIdx];
			if (typeof stop === 'number') showAt(stop, true);
			else showPoint(stop, true);
		};
		svg.onblur = () => {
			activeIdx = -1;
			hideAll();
		};
	}

	// A tap anywhere outside the figure dismisses a touch-pinned readout.
	const outside = (e: PointerEvent) => {
		if (!figure.isConnected) {
			document.removeEventListener('pointerdown', outside);
			return;
		}
		if (!figure.contains(e.target as Node)) hideAll();
	};
	document.addEventListener('pointerdown', outside, { passive: true });

	// --- Legend toggling: hide the series in every variant. At least one
	// series always stays on: switching off the last one would leave an empty
	// grid, so that click turns every series back on instead. ---
	const buttons = Array.from(figure.querySelectorAll<HTMLButtonElement>('[data-series-toggle]'));
	const setHidden = (btn: HTMLButtonElement, hidden: boolean) => {
		const name = btn.dataset.seriesToggle ?? '';
		figure
			.querySelectorAll(`svg.chart-svg [data-series-name="${CSS.escape(name)}"]`)
			.forEach((g) => g.classList.toggle('series-hidden', hidden));
		btn.setAttribute('aria-pressed', String(!hidden));
		btn.classList.toggle('legend-off', hidden);
	};
	buttons.forEach((btn) => {
		btn.onclick = () => {
			const on = buttons.filter((b) => b.getAttribute('aria-pressed') === 'true');
			const turningOff = btn.getAttribute('aria-pressed') === 'true';
			if (turningOff && on.length === 1) {
				buttons.forEach((b) => setHidden(b, false));
			} else {
				setHidden(btn, turningOff);
			}
			hideAll();
		};
	});
}

export function initChartInteractions() {
	document
		.querySelectorAll<HTMLElement>('[data-chart-interactive]:not([data-interact-ready])')
		.forEach((figure) => {
			// Guard key ends in "Ready" so the lab replay button resets it.
			figure.dataset.interactReady = '1';
			setupFigure(figure);
		});
}
