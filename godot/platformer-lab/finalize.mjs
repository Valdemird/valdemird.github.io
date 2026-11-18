// Re-runs the post-processing of lib/media.mjs on clips and posters already on disk.
//
//   node godot/platformer-lab/finalize.mjs public/videos/play/platformer-lab/*.mp4
//   node godot/platformer-lab/finalize.mjs public/images/play/platformer-lab/plataformas-coyote.webp
//
// .mp4 → re-encoded in place (only for raw MediaRecorder output: every pass is lossy).
// .webp → its 320, 640 and 960 wide copies (the -320/-640/-960 files themselves are skipped).
import { finalizeClip, posterSizes } from './lib/media.mjs';

const files = process.argv.slice(2);
if (files.length === 0) {
	console.error('usage: finalize.mjs <clip.mp4|poster.webp> ...');
	process.exit(1);
}
for (const file of files) {
	if (file.endsWith('.mp4')) await finalizeClip(file);
	else if (file.endsWith('.webp') && !/-\d+\.webp$/.test(file)) await posterSizes(file);
	else continue;
	console.log(`✓ ${file}`);
}
