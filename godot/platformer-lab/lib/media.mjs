// Post-processing for the lab's clips and posters, shared by record.mjs,
// posters.mjs and finalize.mjs.
//
// Clips: MediaRecorder writes a fragmented MP4 with no duration in its header
// and, often, repeated timestamps. Browsers differ on how much of that they
// forgive, so every clip is re-encoded into a plain progressive MP4: constant
// 60 fps (the game's own rate: a 45 ms hitstop is three frames), H.264 High,
// index at the front (+faststart), no audio. The recording itself is taken at a
// high bitrate so this is the only lossy pass that shows.
//
// Posters: the 1280×720 screenshot plus 320, 640 and 960 wide copies for srcset
// (320 and 640 are the series hub's thumbnails).
import { spawnSync } from 'node:child_process';
import { rename, rm } from 'node:fs/promises';
import sharp from 'sharp';

export const POSTER_WIDTHS = [320, 640, 960];

/** ffmpeg from $FFMPEG or the PATH; fails with a hint when there is none. */
export function ffmpeg() {
	const bin = process.env.FFMPEG || 'ffmpeg';
	if (spawnSync(bin, ['-version'], { stdio: 'ignore' }).status !== 0) {
		throw new Error(
			'ffmpeg not found. Install it, or point FFMPEG at a binary, e.g.\n' +
				'  FFMPEG=$(uv run --no-project --with imageio-ffmpeg python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")',
		);
	}
	return bin;
}

/** Re-encodes `input` into a progressive MP4 at `output` (they may be the same file). */
export async function finalizeClip(input, output = input, crf = Number(process.env.CRF || 23), fps = Number(process.env.FPS || 60)) {
	const tmp = `${output}.tmp.mp4`;
	const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-an', '-fps_mode', 'cfr', '-r', String(fps),
		'-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-level:v', '4.0',
		'-pix_fmt', 'yuv420p', '-tune', 'animation', '-g', String(fps * 2), '-movflags', '+faststart', tmp];
	const run = spawnSync(ffmpeg(), args, { encoding: 'utf8' });
	if (run.status !== 0) {
		await rm(tmp, { force: true });
		throw new Error(`ffmpeg failed on ${input}: ${run.stderr}`);
	}
	await rename(tmp, output);
}

/** Writes <name>-360.mp4 (640×360) next to a clip: what phones get, through <source media>. */
export async function smallClip(file, crf = Number(process.env.CRF_SMALL || 27)) {
	const out = file.replace(/\.mp4$/, '-360.mp4');
	const tmp = `${out}.tmp.mp4`;
	const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', file, '-an', '-vf', 'scale=640:360:flags=lanczos',
		'-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-level:v', '4.0',
		'-pix_fmt', 'yuv420p', '-tune', 'animation', '-g', '120', '-movflags', '+faststart', tmp];
	const run = spawnSync(ffmpeg(), args, { encoding: 'utf8' });
	if (run.status !== 0) {
		await rm(tmp, { force: true });
		throw new Error(`ffmpeg failed on ${file}: ${run.stderr}`);
	}
	await rename(tmp, out);
}

/** Writes <name>-320/-640/-960.webp next to a 1280-wide <name>.webp poster. */
export async function posterSizes(file) {
	for (const width of POSTER_WIDTHS) {
		await sharp(file).resize({ width }).webp({ quality: 80 }).toFile(file.replace(/\.webp$/, `-${width}.webp`));
	}
}
