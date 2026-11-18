// Videos for the playable lab embeds: the real game, recorded from its canvas.
//
//   node godot/platformer-lab/record.mjs plataformas:coyote:7.5:5 plataformas:buffer:6:5
//
// Each target is <plane>:<sheets>:<seconds on>:<seconds off>[:<extra query>]. The sheet opens in
// "video" mode: the web pilot (overlay/web/pilot.gd) plays its choreography with
// the technique ON; after <seconds on> the recorder presses T, and keeps
// recording <seconds off> with it OFF. Same inputs, both outcomes, one clip.
//
// Writes public/videos/play/platformer-lab/<plane>-<sheets>.mp4 (H.264, no audio),
// recorded with MediaRecorder from the Godot canvas: no ffmpeg needed.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { withBrowser, PUBLIC, SITE, sleep } from './lib/browser.mjs';

const OUT = join(PUBLIC, 'videos/play/platformer-lab');
const BITRATE = Number(process.env.BITRATE || 600_000);
const targets = process.argv.slice(2).map((a) => {
	const [plane, sheets, on, off, extra = ''] = a.split(':');
	return { plane, sheets, on: Number(on || 7), off: Number(off || 5), extra };
});
if (targets.length === 0) {
	console.error('usage: record.mjs <plane>:<sheets>:<seconds on>:<seconds off> ...');
	process.exit(1);
}

const START = `(() => {
	const canvas = document.getElementById('canvas');
	const stream = canvas.captureStream(60);
	const mimeType = 'video/mp4;codecs=avc1.42E01E';
	const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: ${BITRATE} });
	const chunks = [];
	rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
	window.__stop = () => new Promise((resolve) => {
		rec.onstop = async () => {
			const buf = new Uint8Array(await new Blob(chunks, { type: mimeType }).arrayBuffer());
			let bin = '';
			for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
			resolve(btoa(bin));
		};
		rec.stop();
	});
	rec.start(1000);
	return true;
})()`;

const [W, H] = (process.env.SIZE || '960x540').split('x').map(Number);

await mkdir(OUT, { recursive: true });
await withBrowser(async (page) => {
	// The game canvas follows the viewport: a smaller viewport is a lighter video.
	await page.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
	for (const { plane, sheets, on, off, extra } of targets) {
		if (!(await page.openGame(`plano=${plane}&lamina=${sheets}&piloto=1&video=1&lang=en${extra ? `&${extra}` : ''}`))) {
			console.warn(`  ${plane}:${sheets} never finished loading, skipped`);
			continue;
		}
		// The shell hides #status as the first frame is drawn; give the HUD a beat.
		await sleep(150);
		await page.evaluate(START);
		await sleep(on * 1000);
		await page.key('KeyT');
		await sleep(off * 1000);
		const data = await page.evaluate('window.__stop()');
		const file = join(OUT, `${plane}-${sheets.replaceAll(',', '+')}.mp4`);
		await writeFile(file, Buffer.from(data, 'base64'));
		console.log(`✓ ${file.slice(SITE.length)}  (${(data.length * 0.75 / 1024).toFixed(0)} KB, T at ${on}s)`);
	}
});
