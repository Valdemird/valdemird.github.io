/**
 * Postbuild smoke test for dist/.
 *
 * Asserts after `astro build`:
 *   1. Every internal href/src in HTML files resolves to an emitted file.
 *   2. hreflang alternate pairs are reciprocal.
 *   3. Every og:image referenced has its file emitted.
 *   4. Required artifacts exist (og/default.png, rss.xml, es/rss.xml).
 *   5. No link to a retired subdomain (todo./games.valdemird.com) ships, and
 *      every other non-apex *.valdemird.com host is listed as a warning so a
 *      new dependency on a separately hosted app is a conscious choice.
 *
 * Zero dependencies. Exits 1 with a readable failure list, 0 with a summary.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://valdemird.com';
const failures = [];
const warnings = [];

// Subdomains that used to host side projects and are retired for good. Any
// link to them fails the build; a plain-text mention only warns.
const RETIRED_HOSTS = ['todo.valdemird.com', 'games.valdemird.com'];
// Text artifacts worth scanning for hosts (HTML, feeds, llms*.txt, raw .md posts, bundles).
const TEXT_EXT = /\.(html|xml|txt|md|json|js|mjs|css|webmanifest)$/;

if (!existsSync(DIST)) {
	console.error('check-dist: dist/ does not exist — run `astro build` first.');
	process.exit(1);
}

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, out);
		else out.push(full);
	}
	return out;
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

/** Resolve an internal URL path ("/blog/foo/") to an emitted dist file, or null. */
function resolvePath(urlPath) {
	const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
	const candidates = clean.endsWith('/')
		? [clean + 'index.html']
		: [clean, clean + '/index.html', clean + '.html'];
	return candidates.some((c) => existsSync(join(DIST, c)));
}

// --- 1. Internal href/src resolution ---
let linkCount = 0;
for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf8');
	const rel = relative(DIST, file);
	for (const m of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
		const url = m[1];
		if (!url.startsWith('/') || url.startsWith('//')) continue;
		linkCount++;
		if (!resolvePath(url)) failures.push(`broken link: ${url} (referenced in ${rel})`);
	}
}

// --- 2. hreflang reciprocity ---
function pageAlternates(html) {
	const alts = [];
	for (const m of html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/g)) {
		const hreflang = m[0].match(/hreflang=["']([^"']+)["']/)?.[1];
		const href = m[0].match(/href=["']([^"']+)["']/)?.[1];
		if (hreflang && href) alts.push({ hreflang, href });
	}
	return alts;
}

function fileToUrl(file) {
	let p = '/' + relative(DIST, file).replace(/\\/g, '/');
	p = p.replace(/index\.html$/, '');
	return SITE + p;
}

const altCache = new Map(); // url -> alternates[] | null (page missing)
for (const file of htmlFiles) altCache.set(fileToUrl(file), pageAlternates(readFileSync(file, 'utf8')));

let pairCount = 0;
for (const [pageUrl, alts] of altCache) {
	for (const { hreflang, href } of alts) {
		if (hreflang === 'x-default' || href === pageUrl) continue;
		pairCount++;
		const targetAlts = altCache.get(href);
		if (!targetAlts) {
			failures.push(`hreflang: ${pageUrl} declares hreflang=${hreflang} -> ${href}, but that page was not emitted`);
		} else if (!targetAlts.some((a) => a.href === pageUrl)) {
			failures.push(`hreflang not reciprocal: ${pageUrl} -> ${href} (hreflang=${hreflang}), but ${href} does not point back`);
		}
	}
}

// --- 3. og:image files exist ---
let ogCount = 0;
for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf8');
	const rel = relative(DIST, file);
	for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/g)) {
		ogCount++;
		const path = m[1].startsWith(SITE) ? m[1].slice(SITE.length) : m[1];
		if (!path.startsWith('/')) continue; // external image — out of scope
		if (!resolvePath(path)) failures.push(`og:image missing: ${m[1]} (referenced in ${rel})`);
	}
}

// --- 4. Required artifacts ---
for (const required of ['og/default.png', 'rss.xml', 'es/rss.xml']) {
	if (!existsSync(join(DIST, required))) failures.push(`required file missing: dist/${required}`);
}

// --- 4b. Sitemap: blog pairs carry their language alternates, redirects stay out ---
let sitemapBlogCount = 0;
for (const file of allFiles.filter((f) => /sitemap-\d+\.xml$/.test(f))) {
	const xml = readFileSync(file, 'utf8');
	const rel = relative(DIST, file);
	for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
		const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
		if (!loc) continue;
		const path = loc.startsWith(SITE) ? loc.slice(SITE.length) : loc;
		// /es/blog/<slug>/ only exists as a redirect to /blog/es/<slug>/.
		if (/^\/es\/blog\/[^/]+\/$/.test(path)) {
			failures.push(`sitemap lists a redirect page: ${path} (in ${rel})`);
			continue;
		}
		if (!/^\/blog\/(?:es\/)?[^/]+\/$/.test(path) || path === '/blog/es/') continue;
		sitemapBlogCount++;
		const pageAlts = altCache.get(loc);
		const pairedOnPage = Array.isArray(pageAlts) && pageAlts.length >= 2;
		const sitemapAlts = (m[1].match(/<xhtml:link\b/g) ?? []).length;
		if (pairedOnPage && sitemapAlts < 2) {
			failures.push(`sitemap entry without EN/ES alternates: ${path} (in ${rel})`);
		}
	}
}

// --- 5. Subdomain hosts ---
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const retiredAlt = RETIRED_HOSTS.map(escapeRe).join('|');
const retiredLinkRe = new RegExp(
	// An absolute or protocol-relative URL (also with JSON-escaped slashes,
	// `https:\/\/…`), or a bare host used as an href/src/content value.
	`(?:https?:)?\\\\?/\\\\?/(?:${retiredAlt})\\b` + `|\\b(?:href|src|content)=["'](?:${retiredAlt})\\b`,
	'gi',
);
const hostRe = /\b((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+)valdemird\.com\b/gi;
const hostHits = new Map(); // host -> Set(files)
let textFileCount = 0;
for (const file of allFiles.filter((f) => TEXT_EXT.test(f))) {
	const text = readFileSync(file, 'utf8');
	const rel = relative(DIST, file);
	textFileCount++;
	const retiredLinks = new Set([...text.matchAll(retiredLinkRe)].map((m) => m[0]));
	for (const link of retiredLinks) failures.push(`retired subdomain linked: ${link} (in ${rel})`);
	for (const m of text.matchAll(hostRe)) {
		const host = `${m[1]}valdemird.com`.toLowerCase();
		if (!hostHits.has(host)) hostHits.set(host, new Set());
		hostHits.get(host).add(rel);
	}
}
for (const [host, files] of hostHits) {
	const list = [...files];
	const where = `${list.slice(0, 3).join(', ')}${list.length > 3 ? `, +${list.length - 3} more` : ''}`;
	const kind = RETIRED_HOSTS.includes(host) ? 'retired subdomain mentioned' : 'non-apex host';
	warnings.push(`${kind}: ${host} in ${list.length} file(s) (${where})`);
}

if (warnings.length) {
	console.warn(`check-dist: ${warnings.length} warning(s)`);
	for (const w of warnings) console.warn(`  ! ${w}`);
}

if (failures.length) {
	console.error(`check-dist: ${failures.length} failure(s)\n`);
	for (const f of failures) console.error(`  ✗ ${f}`);
	process.exit(1);
}

console.log(`check-dist: OK — ${htmlFiles.length} pages, ${linkCount} internal links, ${pairCount} hreflang pairs, ${ogCount} og:images verified, ${sitemapBlogCount} sitemap blog entries checked, ${textFileCount} text files scanned for subdomains.`);
