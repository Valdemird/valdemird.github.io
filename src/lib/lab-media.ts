// Where a lab sheet's clip and posters live, and their cache-busting URLs.
// Shared by PlayableLab and BlogPost (which preloads a video-first post's poster),
// so both ask for byte-identical URLs.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const inPublic = (publicPath: string) => join(process.cwd(), 'public', publicPath);

/** Clips and posters keep their names when re-recorded; a content hash in the query makes a new file a new URL. */
export function versioned(publicPath: string): string {
	const file = inPublic(publicPath);
	if (!existsSync(file)) return publicPath;
	return `${publicPath}?v=${createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8)}`;
}

export interface LabMedia {
	slug: string;
	/** The 1280-wide poster (unversioned: also the VideoObject thumbnail). */
	poster: string;
	posterSrcset?: string;
	/** The poster a clip shows before playing: the 960 copy, versioned. */
	videoPoster: string;
	/** The clip's public path (unversioned) and its versioned src. */
	video: string;
	videoSrc: string;
	/** The 640×360 copy phones get (record.mjs / finalize.mjs write it), versioned. */
	smallSrc?: string;
	hasVideo: boolean;
}

export function labMedia(plane: string, sheets: string, overrides: { poster?: string; video?: string } = {}): LabMedia {
	const slug = `${plane}-${sheets.replaceAll(',', '+')}`;
	const poster = overrides.poster ?? `/images/play/platformer-lab/${slug}.webp`;
	const video = overrides.video ?? `/videos/play/platformer-lab/${slug}.mp4`;
	const hasVideo = existsSync(inPublic(video));
	const small = video.replace(/\.mp4$/, '-360.mp4');
	// posters.mjs writes -320/-640/-960 copies next to the 1280 poster.
	const sized = (w: number) => poster.replace(/\.webp$/, `-${w}.webp`);
	const posterSrcset = [640, 960].every((w) => existsSync(inPublic(sized(w))))
		? `${sized(640)} 640w, ${sized(960)} 960w, ${poster} 1280w`
		: undefined;
	return {
		slug,
		poster,
		posterSrcset,
		videoPoster: versioned(posterSrcset ? sized(960) : poster),
		video,
		videoSrc: hasVideo ? versioned(video) : video,
		smallSrc: hasVideo && existsSync(inPublic(small)) ? versioned(small) : undefined,
		hasVideo,
	};
}
