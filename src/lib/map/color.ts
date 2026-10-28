/** Resolve a CSS color token to sRGB [r, g, b, 1] for the GPU, without a canvas readback. */

const enc = (c: number) => {
	const v = Math.max(0, Math.min(1, c));
	return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
};

export function oklchToSrgb(L: number, C: number, H: number): [number, number, number] {
	const h = (H * Math.PI) / 180;
	const a = C * Math.cos(h);
	const b = C * Math.sin(h);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [
		enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
		enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
		enc(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
	];
}

const num = (s: string, pct = 1) => (s.endsWith('%') ? (parseFloat(s) / 100) * pct : parseFloat(s));

/** Parse a computed `color` value: oklch(), rgb()/rgba() or color(srgb …). */
export function parseColor(css: string): [number, number, number, number] | null {
	const m = css.match(/^(oklch|rgba?|color)\((.*)\)$/i);
	if (!m) return null;
	const parts = m[2].replace(/,/g, ' ').replace('/', ' ').split(/\s+/).filter(Boolean);
	const fn = m[1].toLowerCase();
	if (fn === 'oklch') {
		const [L, C, H] = [num(parts[0]), num(parts[1], 0.4), parseFloat(parts[2]) || 0];
		return [...oklchToSrgb(L, C, H), 1];
	}
	if (fn === 'color' && parts[0] === 'srgb') return [num(parts[1]), num(parts[2]), num(parts[3]), 1];
	if (fn.startsWith('rgb')) return [num(parts[0], 255) / 255, num(parts[1], 255) / 255, num(parts[2], 255) / 255, 1];
	return null;
}

/** Read a custom property through a probe element's computed `color`. */
export function tokenColor(probe: HTMLElement, token: string): [number, number, number, number] {
	probe.style.color = `var(${token})`;
	const parsed = parseColor(getComputedStyle(probe).color);
	if (parsed) return parsed;
	// Last resort for exotic spaces: one 1x1 canvas read (rare; never per frame).
	const c = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
	if (!c) return [0.5, 0.5, 0.5, 1];
	c.fillStyle = getComputedStyle(probe).color;
	c.fillRect(0, 0, 1, 1);
	const d = c.getImageData(0, 0, 1, 1).data;
	return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
}
