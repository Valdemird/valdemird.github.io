/**
 * Client-side chart interactivity, shared by every SVG chart type.
 *
 * Wires three behaviors onto figures marked `data-chart-interactive`:
 *   1. Hover scrub — a crosshair snaps to the nearest x position and a
 *      floating readout shows every visible series' value there.
 *   2. Keyboard navigation — the SVG is focusable; ←/→ move the active
 *      point, Home/End jump, the readout follows and an aria-live region
 *      announces values.
 *   3. Legend toggling — `[data-series-toggle]` buttons hide/show their
 *      series group and update aria-pressed.
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

function setupFigure(figure: HTMLElement) {
	const svg = figure.querySelector<SVGSVGElement>('svg.chart-svg');
	const body = figure.querySelector<HTMLElement>('.chart-body');
	if (!svg || !body) return;
	const allPoints = collectPoints(svg);
	if (allPoints.length === 0) return;

	// Re-init (lab replay strips the guard): remove anything we created before.
	svg.querySelectorAll('.chart-cross').forEach((el) => el.remove());
	body.querySelectorAll('.chart-tip, .sr-only-chart').forEach((el) => el.remove());

	// --- Crosshair + readout, created client-side so SSR markup stays clean ---
	const ns = 'http://www.w3.org/2000/svg';
	const cross = document.createElementNS(ns, 'line');
	cross.setAttribute('class', 'chart-cross');
	const vb = svg.viewBox.baseVal;
	const padTop = Number(svg.dataset.padTop ?? 16);
	const padBottom = Number(svg.dataset.padBottom ?? 40);
	cross.setAttribute('y1', String(padTop));
	cross.setAttribute('y2', String(vb.height - padBottom));
	cross.setAttribute('hidden', '');
	svg.appendChild(cross);

	const tip = document.createElement('div');
	tip.className = 'chart-tip';
	tip.setAttribute('hidden', '');
	body.style.position = 'relative';
	body.appendChild(tip);

	const live = document.createElement('span');
	live.className = 'sr-only-chart';
	live.setAttribute('aria-live', 'polite');
	body.appendChild(live);

	const hide = () => {
		cross.setAttribute('hidden', '');
		tip.setAttribute('hidden', '');
		for (const p of allPoints) p.el.classList.remove('pt-active');
	};

	const showAt = (stopX: number, announce = false) => {
		const pts = visiblePoints(allPoints).filter((p) => p.x === stopX);
		if (pts.length === 0) {
			hide();
			return;
		}
		cross.setAttribute('x1', String(stopX));
		cross.setAttribute('x2', String(stopX));
		cross.removeAttribute('hidden');

		const label = pts[0].label;
		tip.innerHTML = '';
		const head = document.createElement('strong');
		head.textContent = label;
		tip.appendChild(head);
		for (const p of pts) {
			const row = document.createElement('span');
			row.className = 'chart-tip-row';
			row.textContent = p.series ? `${p.series}: ${p.value}` : p.value;
			tip.appendChild(row);
		}
		tip.removeAttribute('hidden');

		// Position the HTML tip over the SVG point (viewBox → CSS px).
		const rect = svg.getBoundingClientRect();
		const bodyRect = body.getBoundingClientRect();
		const scaleX = rect.width / vb.width;
		const cssX = rect.left - bodyRect.left + stopX * scaleX;
		const topY = Math.min(...pts.map((p) => p.y));
		const scaleY = rect.height / vb.height;
		const cssY = rect.top - bodyRect.top + topY * scaleY;
		tip.style.left = `${cssX}px`;
		tip.style.top = `${cssY}px`;

		for (const p of allPoints) p.el.classList.toggle('pt-active', p.x === stopX);
		if (announce) live.textContent = `${label}: ${pts.map((p) => (p.series ? `${p.series} ${p.value}` : p.value)).join(', ')}`;
	};

	// Handler properties (not addEventListener) so a re-init replaces the old
	// handlers instead of stacking duplicates on the same DOM.
	svg.onpointermove = (e) => {
		const rect = svg.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * vb.width;
		const stops = xStops(visiblePoints(allPoints));
		if (stops.length === 0) return;
		showAt(nearestStop(stops, x));
	};
	svg.onpointerleave = hide;

	// --- Keyboard navigation ---
	let activeIdx = -1;
	svg.setAttribute('tabindex', '0');
	svg.onkeydown = (e) => {
		const stops = xStops(visiblePoints(allPoints));
		if (stops.length === 0) return;
		let next = activeIdx;
		if (e.key === 'ArrowRight') next = Math.min(activeIdx + 1, stops.length - 1);
		else if (e.key === 'ArrowLeft') next = Math.max(activeIdx - 1, 0);
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = stops.length - 1;
		else if (e.key === 'Escape') {
			activeIdx = -1;
			hide();
			return;
		} else return;
		e.preventDefault();
		activeIdx = next === -1 ? 0 : next;
		showAt(stops[activeIdx], true);
	};
	svg.onblur = () => {
		activeIdx = -1;
		hide();
	};

	// --- Legend toggling ---
	figure.querySelectorAll<HTMLButtonElement>('[data-series-toggle]').forEach((btn) => {
		btn.onclick = () => {
			const name = btn.dataset.seriesToggle ?? '';
			const group = svg.querySelector(`[data-series-name="${CSS.escape(name)}"]`);
			if (!group) return;
			const nowHidden = group.classList.toggle('series-hidden');
			btn.setAttribute('aria-pressed', String(!nowHidden));
			btn.classList.toggle('legend-off', nowHidden);
			hide();
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
