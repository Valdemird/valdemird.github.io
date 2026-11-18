// Posters for the playable lab embeds: real screenshots of the web export.
//
//   node godot/platformer-lab/posters.mjs plataformas:coyote plataformas:buffer combate:c_pogo
//
// Opens each sheet in headless Chrome, waits for the engine to boot and writes
// public/images/play/platformer-lab/<plane>-<sheets>.webp (1280×720).
// Needs Google Chrome installed and a fresh `build.sh` output in public/play/.
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { withBrowser, PUBLIC, SITE, sleep } from './lib/browser.mjs';

const OUT = join(PUBLIC, 'images/play/platformer-lab');
const SETTLE_MS = Number(process.env.SETTLE_MS || 1500);
const targets = process.argv.slice(2).map((a) => {
	const [plane, sheets] = a.split(':');
	return { plane, sheets };
});
if (targets.length === 0) {
	console.error('usage: posters.mjs <plane>:<sheet>[,<sheet>] ...');
	process.exit(1);
}

await mkdir(OUT, { recursive: true });
await withBrowser(async (page) => {
	for (const { plane, sheets } of targets) {
		if (!(await page.openGame(`plano=${plane}&lamina=${sheets}`))) {
			console.warn(`  ${plane}:${sheets} never finished loading, skipped`);
			continue;
		}
		await sleep(SETTLE_MS);
		const shot = await page.send('Page.captureScreenshot', { format: 'png' });
		const file = join(OUT, `${plane}-${sheets.replaceAll(',', '+')}.webp`);
		await sharp(Buffer.from(shot.data, 'base64')).webp({ quality: 82 }).toFile(file);
		console.log(`✓ ${file.slice(SITE.length)}`);
	}
});
