/**
 * Postbuild smoke test for dist/.
 *
 * Asserts after `astro build`:
 *   1. Every internal href/src in HTML files resolves to an emitted file.
 *   2. hreflang alternate pairs are reciprocal.
 *   3. Every og:image referenced has its file emitted.
 *   4. Required artifacts exist (og/default.png, rss.xml, es/rss.xml).
 *
 * Zero dependencies. Exits 1 with a readable failure list, 0 with a summary.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://valdemird.com';
const failures = [];

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
		// The 404 page's language switch points at /es/404/ — no file exists, but
		// GitHub Pages serves 404.html for any missing path, so it's intentional.
		if (rel === '404.html' && /^\/(es\/)?404\/?$/.test(url)) continue;
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

if (failures.length) {
	console.error(`check-dist: ${failures.length} failure(s)\n`);
	for (const f of failures) console.error(`  ✗ ${f}`);
	process.exit(1);
}

console.log(`check-dist: OK — ${htmlFiles.length} pages, ${linkCount} internal links, ${pairCount} hreflang pairs, ${ogCount} og:images verified.`);
