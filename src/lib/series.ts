// Blog series: the hub URL, the ordered parts, and what each part's card shows.
// The table itself (names, slugs, parts) lives in SERIES in consts.ts.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SERIES, type SeriesId } from '../consts';
import { readingMinutes } from './learn';

type Lang = 'en' | 'es';
export const SITE_URL = 'https://valdemird.com';

export function isSeriesId(id: string | undefined): id is SeriesId {
	return !!id && id in SERIES;
}

/** /blog/series/<slug>/ in English, /es/blog/series/<slug>/ in Spanish (like the ES blog index). */
export function seriesHref(id: SeriesId, lang: Lang): string {
	return `${lang === 'es' ? '/es' : ''}/blog/series/${SERIES[id].slug}/`;
}

export function seriesUrl(id: SeriesId, lang: Lang): string {
	return `${SITE_URL}${seriesHref(id, lang)}`;
}

/** JSON-LD @id of the CreativeWorkSeries node, shared by the hub and every part. */
export function seriesNodeId(id: SeriesId, lang: Lang): string {
	return `${seriesUrl(id, lang)}#series`;
}

/** The series' posts in one language, in reading order. */
export async function getSeriesPosts(id: SeriesId, lang: Lang): Promise<CollectionEntry<'blog'>[]> {
	return (await getCollection('blog'))
		.filter((p) => p.data.series === id && (p.data.lang ?? 'en') === lang && !p.data.draft)
		.sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}

const POSTERS = '/images/play/platformer-lab';
const CLIPS = '/videos/play/platformer-lab';
const inPublic = (path: string) => existsSync(join(process.cwd(), 'public', path));

export interface SeriesCard {
	id: string;
	href: string;
	/** seriesTitle, or the full title when the post has none. */
	title: string;
	fullTitle: string;
	description: string;
	order: number;
	minutes: number;
	/** 640-wide poster of the post's first sheet, if there is one. */
	thumb?: string;
	/** srcset with its 320 and 640 copies. */
	thumbSrcset?: string;
	sheets: number;
	clips: number;
}

export async function getSeriesCards(id: SeriesId, lang: Lang): Promise<SeriesCard[]> {
	const posts = await getSeriesPosts(id, lang);
	return posts.map((post, i) => {
		const tags = [...(post.body ?? '').matchAll(/<PlayableLab\b([\s\S]*?)\/>/g)].map((m) => {
			const sheets = m[1].match(/\bsheets="([^"]+)"/)?.[1] ?? '';
			const plane = m[1].match(/\bplane="([^"]+)"/)?.[1] ?? 'plataformas';
			return `${plane}-${sheets.replaceAll(',', '+')}`;
		});
		const first = tags[0];
		const thumb = first && inPublic(`${POSTERS}/${first}-640.webp`) ? `${POSTERS}/${first}-640.webp` : undefined;
		const small = thumb?.replace(/-640\.webp$/, '-320.webp');
		const thumbSrcset = thumb && small && inPublic(small) ? `${small} 320w, ${thumb} 640w` : undefined;
		return {
			id: post.id,
			href: `/blog/${post.id}/`,
			title: post.data.seriesTitle ?? post.data.title,
			fullTitle: post.data.title,
			description: post.data.description,
			order: i + 1,
			minutes: readingMinutes(post.body),
			thumb,
			thumbSrcset,
			sheets: tags.length,
			clips: tags.filter((t) => inPublic(`${CLIPS}/${t}.mp4`)).length,
		};
	});
}

export interface SeriesStats {
	posts: number;
	sheets: number;
	clips: number;
	minutes: number;
	updated: Date;
}

export async function getSeriesStats(id: SeriesId, lang: Lang): Promise<SeriesStats> {
	const posts = await getSeriesPosts(id, lang);
	const cards = await getSeriesCards(id, lang);
	const updated = posts.reduce(
		(latest, p) => {
			const d = p.data.updatedDate ?? p.data.pubDate;
			return d > latest ? d : latest;
		},
		new Date(0),
	);
	return {
		posts: cards.length,
		sheets: cards.reduce((n, c) => n + c.sheets, 0),
		clips: cards.reduce((n, c) => n + c.clips, 0),
		minutes: cards.reduce((n, c) => n + c.minutes, 0),
		updated,
	};
}
