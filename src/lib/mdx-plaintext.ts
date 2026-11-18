/**
 * Shared plaintext utilities for MDX blog bodies.
 *
 * Strips JSX/imports/HTML entities so the result can be served as raw
 * markdown (per-post `.md`, `llms.txt`, `llms-full.txt`) or counted as
 * prose words for SEO/JSON-LD.
 *
 * Components that carry the post's facts (TL;DR bullets, StatGrid numbers,
 * playable sheets with their steps, callout titles, code filenames) are
 * rewritten as plain markdown first, so an agent reading the `.md` gets the
 * same facts a human sees on the page instead of a hole where they were.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://valdemird.com';

/** String literals ("…", '…', `…`) inside a JS-ish snippet, unescaped. */
function literals(snippet: string): string[] {
	const out: string[] = [];
	const literal = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
	let m: RegExpExecArray | null;
	while ((m = literal.exec(snippet)) !== null) out.push(m[2].replace(/\\(.)/g, '$1'));
	return out;
}

/** Value of a quoted attribute (`name="…"`) in a component's attribute block. */
function attr(block: string, name: string): string | undefined {
	const m = block.match(new RegExp(`\\b${name}=(["'])((?:\\\\.|(?!\\1)[^\\\\])*)\\1`));
	return m ? m[2] : undefined;
}

/** String literals of an array attribute (`name={[ "…", "…" ]}`). */
function arrayAttr(block: string, name: string): string[] {
	const m = block.match(new RegExp(`\\b${name}=\\{\\[([\\s\\S]*?)\\]\\}`));
	return m ? literals(m[1]) : [];
}

const stripTags = (s: string) => s.replace(/<\/?\w+[^>]*>/g, '');

function playableToMarkdown(block: string, lang: string): string {
	const es = lang === 'es';
	const title = attr(block, 'title') ?? '';
	const sheets = attr(block, 'sheets') ?? '';
	const plane = attr(block, 'plane') ?? 'plataformas';
	const note = attr(block, 'videoNote');
	const steps = arrayAttr(block, 'steps');
	const slug = `${plane}-${sheets.replaceAll(',', '+')}`;
	const video = `/videos/play/platformer-lab/${slug}.mp4`;
	const play = `${SITE}/play/platformer-lab/index.html?${new URLSearchParams({ plano: plane, lamina: sheets, lang })}`;
	const lines = [`**${es ? 'Lámina jugable' : 'Playable sheet'}: ${title}** (${es ? 'el juego real, en la página' : 'the real game, in the page'})`, ''];
	if (existsSync(join(process.cwd(), 'public', video))) {
		lines.push(`- ${es ? 'Video' : 'Video'}: ${SITE}${video}${note ? ` (${note})` : ''}`);
	}
	lines.push(`- ${es ? 'Jugar' : 'Play'}: ${play}`);
	if (steps.length) {
		lines.push('', `${es ? 'Cómo probarlo' : 'How to try it'}:`, ...steps.map((s, i) => `${i + 1}. ${stripTags(s)}`));
	}
	return `\n${lines.join('\n')}\n`;
}

function statsToMarkdown(block: string): string {
	const stats = [...block.matchAll(/\{\s*value:\s*(["'])(.*?)\1\s*,\s*label:\s*(["'])(.*?)\3(?:\s*,\s*context:\s*(["'])(.*?)\5)?\s*\}/g)];
	if (!stats.length) return '';
	return `\n${stats.map((m) => `- **${m[2]}** ${m[4]}${m[6] ? ` (${m[6]})` : ''}`).join('\n')}\n`;
}

function tldrToMarkdown(block: string): string {
	const bullets = arrayAttr(block, 'bullets');
	return bullets.length ? `\n**TL;DR**\n\n${bullets.map((b) => `- ${b}`).join('\n')}\n` : '';
}

/** Rewrites fact-carrying components as markdown. Fail-soft: unknown shapes are left for stripping. */
/** TimingDiagram: its title and each window with what a press inside it does, on and off. */
function timingToMarkdown(block: string, lang: string): string {
	const es = lang === 'es';
	const title = attr(block, 'title');
	const windows = block.match(/windows=\{\[([\s\S]*)\]\}/)?.[1] ?? '';
	const items = windows
		.split(/(?=\{\s*from:)/)
		.map((w) => {
			const label = w.match(/label:\s*"([^"]*)"/)?.[1];
			if (!label) return '';
			const detail = w.match(/detail:\s*"([^"]*)"/)?.[1];
			const on = w.match(/on:\s*\{[^}]*text:\s*"([^"]*)"/)?.[1]?.replaceAll('{ms}', 'n');
			const off = w.match(/off:\s*\{[^}]*text:\s*"([^"]*)"/)?.[1]?.replaceAll('{ms}', 'n');
			return `- ${label}${detail ? ` (${detail})` : ''}: ${es ? 'con la técnica' : 'with the technique'}, ${on ?? ''} ${es ? 'Sin ella' : 'Without it'}, ${off ?? ''}`;
		})
		.filter(Boolean);
	return `\n${title ? `**${title}.**\n` : ''}${items.join('\n')}\n`;
}

function componentsToMarkdown(raw: string, lang: string): string {
	try {
		return raw
			.replace(/<TLDR\b([\s\S]*?)\/>/g, (_, block: string) => tldrToMarkdown(block))
			.replace(/<StatGrid\b([\s\S]*?)\/>/g, (_, block: string) => statsToMarkdown(block))
			.replace(/<PlayableLab\b([\s\S]*?)\/>/g, (_, block: string) => playableToMarkdown(block, lang))
			.replace(/<TimingDiagram\b([\s\S]*?)\/>/g, (_, block: string) => timingToMarkdown(block, lang))
			.replace(/<Callout\b([^>]*)>/g, (_, block: string) => {
				const title = attr(block, 'title');
				return title ? `\n**${title}.** ` : '';
			})
			.replace(/<CodeBlock\b([^>]*)>/g, (_, block: string) => {
				const file = attr(block, 'filename');
				return file ? `\n\`${file}\`:\n` : '';
			});
	} catch {
		return raw;
	}
}

export function cleanMdxBody(raw: string, lang = 'en'): string {
	return componentsToMarkdown(raw, lang)
		.replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, '')
		.replace(/<\w+[\s\S]*?\/>/g, '')
		.replace(/<\/?\w+[^>]*>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

export function countWords(plain: string): number {
	if (!plain) return 0;
	return plain.split(/\s+/).filter(Boolean).length;
}

/**
 * Pull the bullets out of the FIRST `<TLDR bullets={[...]}` block in a raw
 * MDX body. Parses the array's string literals (single/double/backtick
 * quoted). Fail-soft: returns null on anything unexpected so callers can
 * simply omit the derived field.
 */
export function extractTldr(body: string): string[] | null {
	if (!body) return null;
	try {
		const block = body.match(/<TLDR[\s\S]*?bullets=\{\[([\s\S]*?)\]\}/);
		if (!block) return null;
		const bullets = literals(block[1]);
		return bullets.length > 0 ? bullets : null;
	} catch {
		return null;
	}
}
