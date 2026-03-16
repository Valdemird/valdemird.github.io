import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let cachedFonts: { serif: Buffer; serifBold: Buffer; sans: Buffer } | null = null;

export function getOgFonts() {
	if (!cachedFonts) {
		const fontsDir = resolve(process.cwd(), 'src/fonts');
		cachedFonts = {
			serif: readFileSync(resolve(fontsDir, 'FreeSerif.ttf')),
			serifBold: readFileSync(resolve(fontsDir, 'FreeSerifBold.ttf')),
			sans: readFileSync(resolve(fontsDir, 'FreeSans.ttf')),
		};
	}
	return cachedFonts;
}

export function getOgSatoriFonts() {
	const fonts = getOgFonts();
	return [
		{ name: 'Serif', data: fonts.serif, weight: 400 as const, style: 'normal' as const },
		{ name: 'Serif', data: fonts.serifBold, weight: 700 as const, style: 'normal' as const },
		{ name: 'Sans', data: fonts.sans, weight: 400 as const, style: 'normal' as const },
	];
}
