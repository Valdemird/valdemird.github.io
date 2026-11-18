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
// recorded with MediaRecorder from the Godot canvas and then re-encoded by ffmpeg
// into a plain progressive MP4 (lib/media.mjs explains why; set FFMPEG if it
// isn't on the PATH).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { withBrowser, PUBLIC, SITE, sleep } from './lib/browser.mjs';
import { ffmpeg, finalizeClip, smallClip } from './lib/media.mjs';

const OUT = join(PUBLIC, 'videos/play/platformer-lab');
// uploadDate and duration of each clip, for PlayableLab's VideoObject (a file's
// mtime is the checkout time in CI, so it can't be the date).
const MANIFEST = join(SITE, 'src/data/platformer-lab-clips.json');
// High on purpose: this is the intermediate; lib/media.mjs sets the final size.
const BITRATE = Number(process.env.BITRATE || 12_000_000);
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

const [W, H] = (process.env.SIZE || '1280x720').split('x').map(Number);

ffmpeg(); // fail before recording anything, not after
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
		const raw = `${file}.raw.mp4`;
		await writeFile(raw, Buffer.from(data, 'base64'));
		await finalizeClip(raw, file);
		await smallClip(file);
		if (!process.env.KEEP_RAW) await rm(raw);
		const clips = JSON.parse(await readFile(MANIFEST, 'utf8').catch(() => '{}'));
		clips[`${plane}-${sheets.replaceAll(',', '+')}`] = { uploadDate: new Date().toISOString().slice(0, 10), duration: `PT${Math.round(on + off)}S` };
		await writeFile(MANIFEST, JSON.stringify(clips, null, '\t') + '\n');
		console.log(`✓ ${file.slice(SITE.length)}  (T at ${on}s)`);
	}
});
