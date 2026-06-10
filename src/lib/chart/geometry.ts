/**
 * Build-time SVG path generation — thin wrappers over d3-shape.
 * Runs in .astro frontmatter only; nothing here ships to the client.
 */
import { line, area, curveMonotoneX, curveLinear } from 'd3-shape';

export type CurveKind = 'linear' | 'monotone';
export type XY = [number, number];

function curveOf(kind: CurveKind) {
	return kind === 'monotone' ? curveMonotoneX : curveLinear;
}

/** SVG path for a polyline through pixel-space points. */
export function linePath(points: XY[], curve: CurveKind = 'linear'): string {
	return line<XY>().x((p) => p[0]).y((p) => p[1]).curve(curveOf(curve))(points) ?? '';
}

/** SVG path for the filled area under a line, down to `baselineY`. */
export function areaPath(points: XY[], baselineY: number, curve: CurveKind = 'linear'): string {
	return (
		area<XY>()
			.x((p) => p[0])
			.y1((p) => p[1])
			.y0(baselineY)
			.curve(curveOf(curve))(points) ?? ''
	);
}
