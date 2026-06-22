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

// Build a URL -> lastmod (ISO date) map from real blog frontmatter so the
// sitemap reflects content-modified dates, not the build timestamp.
const SITE = 'https://valdemird.com';
const BLOG_DIR = fileURLToPath(new URL('./src/content/blog', import.meta.url));

function* walk(dir, base = '') {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const rel = base ? `${base}/${entry.name}` : entry.name;
		if (entry.isDirectory()) yield* walk(`${dir}/${entry.name}`, rel);
		else if (/\.(md|mdx)$/.test(entry.name)) yield { path: `${dir}/${entry.name}`, id: rel.replace(/\.(md|mdx)$/, '') };
	}
}

function frontmatterDate(raw) {
	const fm = raw.split(/^---\s*$/m)[1] ?? '';
	const pick = (key) => {
		const m = fm.match(new RegExp(`^${key}:\\s*['"]?([0-9]{4}-[0-9]{2}-[0-9]{2})`, 'm'));
		return m ? m[1] : null;
	};
	return pick('reviewedDate') ?? pick('updatedDate') ?? pick('pubDate');
}

const blogLastmod = new Map();
for (const { path, id } of walk(BLOG_DIR)) {
	const date = frontmatterDate(readFileSync(path, 'utf8'));
	if (date) blogLastmod.set(`${SITE}/blog/${id}/`, new Date(date).toISOString());
}

// https://astro.build/config
export default defineConfig({
	site: 'https://valdemird.com',
	integrations: [
		mdx(),
		sitemap({
			// i18n: emit <xhtml:link rel="alternate" hreflang> for EN/ES pairs in the
			// sitemap itself, reinforcing the in-<head> hreflang signals.
			i18n: {
				defaultLocale: 'en',
				locales: { en: 'en-US', es: 'es-ES' },
			},
			// Accurate lastmod from real content dates (reviewed > updated > publish),
			// not the build timestamp — Google distrusts sitemaps with bogus lastmod.
			// No priority/changefreq: Google ignores both.
			serialize(item) {
				const date = blogLastmod.get(item.url);
				if (date) item.lastmod = date;
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
