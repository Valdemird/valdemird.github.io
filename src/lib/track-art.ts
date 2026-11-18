// The learn-track pictures (TrackArtAgent, TrackArtClip) move only while on
// screen: this marks each one `.is-live` while visible and plays its clip, if it
// has one, unless the reader asked for reduced motion or saves data. Safe to call
// more than once per page: every picture is observed once.

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
let observer: IntersectionObserver | undefined;
const seen = new WeakSet<Element>();

export function initTrackArt() {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const art = entry.target as HTMLElement;
				art.classList.toggle('is-live', entry.isIntersecting);
				const clip = art.querySelector<HTMLVideoElement>('[data-track-clip]');
				if (!clip) continue;
				if (entry.isIntersecting && !reduceMotion() && !saveData()) clip.play().catch(() => {});
				else clip.pause();
			}
		},
		{ threshold: 0.35 },
	);
	document.querySelectorAll('[data-track-art]').forEach((el) => {
		if (seen.has(el)) return;
		seen.add(el);
		observer!.observe(el);
	});
}

let wired = false;

/** Called from each picture component's script; wires the page once. */
export function initTrackArtOnPage() {
	initTrackArt();
	if (wired) return;
	wired = true;
	// View Transitions swap the DOM: drop the old pictures, observe the new page's.
	document.addEventListener('astro:before-swap', () => {
		observer?.disconnect();
		observer = undefined;
	});
	document.addEventListener('astro:after-swap', initTrackArt);
}
