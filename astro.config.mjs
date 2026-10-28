import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { readdirSync, readFileSync } from 'node:fs';

// Wrap every <table> in a horizontally-scrollable div so wide tables scroll
// instead of being clipped by the page-level `overflow-x: hidden` on mobile.
function rehypeWrapTables() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (
				node.tagName === 'table' &&
				parent &&
				index !== null &&
				!(parent.tagName === 'div' && parent.properties?.className?.includes?.('table-scroll'))
			) {
				parent.children[index] = {
					type: 'element',
					tagName: 'div',
					properties: { className: ['table-scroll'] },
					children: [node],
				};
			}
		});
	};
}
import { fileURLToPath } from 'node:url';

// Build a URL -> lastmod (ISO date) map from real blog and learn frontmatter so
// the sitemap reflects content-modified dates, not the build timestamp.
const SITE = 'https://valdemird.com';
const BLOG_DIR = fileURLToPath(new URL('./src/content/blog', import.meta.url));
const LEARN_DIR = fileURLToPath(new URL('./src/content/learn', import.meta.url));
const SOURCE_NOTES_FILE = fileURLToPath(new URL('./src/lib/learn-source-notes.ts', import.meta.url));
const LEARN_COURSE = 'agentic-systems'; // mirrors COURSE_SLUG in src/lib/learn.ts
const SITEMAP_LOCALES = { en: 'en-US', es: 'es-ES' };

function* walk(dir, base = '') {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const rel = base ? `${base}/${entry.name}` : entry.name;
		if (entry.isDirectory()) yield* walk(`${dir}/${entry.name}`, rel);
		else if (/\.(md|mdx)$/.test(entry.name)) yield { path: `${dir}/${entry.name}`, id: rel.replace(/\.(md|mdx)$/, '') };
	}
}

function frontmatter(raw) {
	return raw.split(/^---\s*$/m)[1] ?? '';
}

function frontmatterDate(raw) {
	const fm = frontmatter(raw);
	const pick = (key) => {
		const m = fm.match(new RegExp(`^${key}:\\s*['"]?([0-9]{4}-[0-9]{2}-[0-9]{2})`, 'm'));
		return m ? m[1] : null;
	};
	return pick('reviewedDate') ?? pick('updatedDate') ?? pick('pubDate');
}

const blogLastmod = new Map();
const blogIds = new Set();
for (const { path, id } of walk(BLOG_DIR)) {
	blogIds.add(id);
	const date = frontmatterDate(readFileSync(path, 'utf8'));
	if (date) blogLastmod.set(`${SITE}/blog/${id}/`, new Date(date).toISOString());
}

// ES posts live at /blog/es/<slug>/, but every other ES page is /es/... so
// /es/blog/<slug>/ is the URL people guess. Redirect each one (GitHub Pages is
// static, so Astro emits a meta-refresh page per entry).
const esBlogSlugs = [...blogIds].filter((id) => id.startsWith('es/')).map((id) => id.slice(3));
const esBlogRedirects = Object.fromEntries(esBlogSlugs.map((slug) => [`/es/blog/${slug}`, `/blog/es/${slug}/`]));

// Sitemap hreflang for blog pairs. The i18n option below only pairs /es/-prefixed
// URLs, so /blog/<slug>/ and /blog/es/<slug>/ need their alternates set by hand.
const blogAlternates = new Map();
for (const slug of esBlogSlugs) {
	if (!blogIds.has(slug)) continue;
	const links = [
		{ url: `${SITE}/blog/${slug}/`, lang: SITEMAP_LOCALES.en },
		{ url: `${SITE}/blog/es/${slug}/`, lang: SITEMAP_LOCALES.es },
	];
	for (const { url } of links) blogAlternates.set(url, links);
}

// Learn modules: lastmod from updatedDate, at /learn/<course>/<slug>/ and the ES twin.
const learnLastmod = new Map();
for (const { path, id } of walk(LEARN_DIR)) {
	const date = frontmatterDate(readFileSync(path, 'utf8'));
	if (!date) continue;
	const url = id.startsWith('es/')
		? `${SITE}/es/learn/${LEARN_COURSE}/${id.slice(3)}/`
		: `${SITE}/learn/${LEARN_COURSE}/${id}/`;
	learnLastmod.set(url, new Date(date).toISOString());
}

// Build-time guard: every key in SOURCE_NOTES must point at a source that its
// module actually lists (by url, or by title when the source has no url).
// A mismatched key renders nothing, silently, so fail the build instead.
function checkSourceNoteKeys() {
	const notes = readFileSync(SOURCE_NOTES_FILE, 'utf8');
	const keys = [...notes.matchAll(/^\s*["']([a-z0-9-]+::[^"']+)["']\s*:/gm)].map((m) => m[1]);
	const refsBySlug = new Map();
	for (const { path, id } of walk(LEARN_DIR)) {
		const slug = id.replace(/^es\//, '');
		const refs = refsBySlug.get(slug) ?? new Set();
		for (const line of frontmatter(readFileSync(path, 'utf8')).split('\n')) {
			if (!/^\s*-\s*\{.*\bgrade:/.test(line)) continue;
			const url = line.match(/\burl:\s*["']([^"']+)["']/)?.[1];
			const title = line.match(/\btitle:\s*"((?:[^"\\]|\\.)*)"|\btitle:\s*'([^']*)'/);
			if (url) refs.add(url);
			else if (title) refs.add(title[1] ?? title[2]);
		}
		refsBySlug.set(slug, refs);
	}
	const bad = keys.filter((k) => {
		const [slug, ref] = k.split('::');
		return !refsBySlug.get(slug)?.has(ref);
	});
	if (bad.length) {
		throw new Error(
			`learn-source-notes: ${bad.length} key(s) match no source in their module:\n` +
				bad.map((k) => `  - ${k}`).join('\n') +
				'\nFix the key in src/lib/learn-source-notes.ts to the exact `url` in the module frontmatter.',
		);
	}
}

const learnSourceNotesCheck = {
	name: 'learn-source-notes-check',
	hooks: {
		'astro:build:start': () => checkSourceNoteKeys(),
	},
};

// https://astro.build/config
export default defineConfig({
	site: 'https://valdemird.com',
	redirects: esBlogRedirects,
	integrations: [
		learnSourceNotesCheck,
		mdx(),
		sitemap({
			// i18n: emit <xhtml:link rel="alternate" hreflang> for EN/ES pairs in the
			// sitemap itself, reinforcing the in-<head> hreflang signals.
			i18n: {
				defaultLocale: 'en',
				locales: SITEMAP_LOCALES,
			},
			// Keep the /es/blog/<slug>/ redirect stubs out of the sitemap.
			filter: (page) => !(page.startsWith(`${SITE}/es/blog/`) && page !== `${SITE}/es/blog/`),
			// Accurate lastmod from real content dates (reviewed > updated > publish),
			// not the build timestamp — Google distrusts sitemaps with bogus lastmod.
			// No priority/changefreq: Google ignores both.
			serialize(item) {
				const date = blogLastmod.get(item.url) ?? learnLastmod.get(item.url);
				if (date) item.lastmod = date;
				const links = blogAlternates.get(item.url);
				if (links) item.links = links;
				return item;
			},
		}),
	],
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	markdown: {
		// GFM enables markdown tables (and strikethrough/autolinks). The MDX
		// integration extends this config, so tables in .mdx render too.
		remarkPlugins: [remarkGfm],
		rehypePlugins: [rehypeWrapTables],
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
	},
	prefetch: true,
});
