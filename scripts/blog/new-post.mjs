#!/usr/bin/env node
/**
 * Scaffold a new blog post in both English and Spanish.
 *
 *   npm run new-post -- --slug retry-backoff --title "Retry backoff done right"
 *
 * Optional flags:
 *   --description "<text>"   pre-fill frontmatter description
 *   --tags tag1,tag2         comma-separated tag list
 *   --featured               mark featured: true
 *   --force                  overwrite existing files
 *
 * Creates:
 *   src/content/blog/<slug>.mdx              (lang: en, imports use ../../components/)
 *   src/content/blog/es/<slug>.mdx           (lang: es, imports use ../../../components/)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const EN_DIR = path.join(ROOT, 'src', 'content', 'blog');
const ES_DIR = path.join(EN_DIR, 'es');

function parseArgs(argv) {
	const out = { tags: [], featured: false, force: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--slug') out.slug = argv[++i];
		else if (arg === '--title') out.title = argv[++i];
		else if (arg === '--description') out.description = argv[++i];
		else if (arg === '--tags') out.tags = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
		else if (arg === '--featured') out.featured = true;
		else if (arg === '--force') out.force = true;
	}
	return out;
}

function slugify(s) {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function today() {
	return new Date().toISOString().slice(0, 10);
}

function frontmatter({ title, description, pubDate, tags, featured, lang, heroImage }) {
	const tagStr = tags.length ? `[${tags.map((t) => JSON.stringify(t.toLowerCase())).join(', ')}]` : '[]';
	const lines = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`description: ${JSON.stringify(description)}`,
		`pubDate: ${pubDate}`,
		`tags: ${tagStr}`,
		`featured: ${featured ? 'true' : 'false'}`,
		`lang: ${lang}`,
	];
	if (heroImage) lines.push(`heroImage: ${JSON.stringify(heroImage)}`);
	lines.push(
		`tldr:`,
		`  - "First punchy takeaway — something specific, not generic."`,
		`  - "Second takeaway. Ideas the skimmer should leave with."`,
		`  - "Third. 3–5 bullets total."`,
		`comments: false`,
		'---',
		'',
	);
	return lines.join('\n');
}

function enTemplate({ title }) {
	return `import Callout from '../../components/blog/Callout.astro';
import CodeBlock from '../../components/blog/CodeBlock.astro';
import Sidenote from '../../components/blog/Sidenote.astro';

${intro(title)}

## The setup

Open with the problem the reader has lived. Make it specific — a moment, not a category.

<Callout type="important" title="The thesis">
State your position in one sentence. Bold. The rest of the post is evidence.
</Callout>

## The argument

Body section. Show, don't claim. Use a CodeBlock, a Playground, an InteractiveChart, or a DataTable every ~250 words.<Sidenote>Use Sidenote for tangents and sources — never footnotes.</Sidenote>

<CodeBlock filename="example.ts">
\`\`\`typescript
// Real code goes here.
\`\`\`
</CodeBlock>

## The payoff

Close with conviction, not a summary. End where the reader should feel something.
`;
}

function esTemplate({ title }) {
	return `import Callout from '../../../components/blog/Callout.astro';
import CodeBlock from '../../../components/blog/CodeBlock.astro';
import Sidenote from '../../../components/blog/Sidenote.astro';

${intro(title)}

## El contexto

Abre con el momento que el lector ya vivió. Específico — un instante, no una categoría.

<Callout type="important" title="La tesis">
Toma una posición clara en una frase. En negrita. El resto del post es evidencia.
</Callout>

## El argumento

Cuerpo. Muestra, no afirmes. Inserta un componente interactivo cada ~250 palabras.<Sidenote>Usa Sidenote para tangentes y fuentes — nunca footnotes.</Sidenote>

<CodeBlock filename="example.ts">
\`\`\`typescript
// Código real va aquí.
\`\`\`
</CodeBlock>

## El cierre

Cierra con convicción, no con resumen. Termina donde el lector deba sentir algo.
`;
}

function intro(title) {
	return `{/* ${title} */}\n`;
}

function writePost(filePath, body, force) {
	if (fs.existsSync(filePath) && !force) {
		console.error(`✗ Refusing to overwrite ${filePath} (pass --force to override).`);
		process.exit(1);
	}
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, body, 'utf8');
	console.log(`✓ ${path.relative(ROOT, filePath)}`);
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	if (!args.slug && !args.title) {
		console.error('Usage: npm run new-post -- --slug <slug> --title "<title>"');
		process.exit(2);
	}
	const title = args.title || args.slug;
	const slug = slugify(args.slug || args.title);
	if (!slug) {
		console.error('Could not derive a valid slug.');
		process.exit(2);
	}
	const description = args.description || 'A compelling 1–2 sentence hook that makes someone want to read.';
	const pubDate = today();
	const tags = args.tags || [];
	const featured = args.featured;

	const enPath = path.join(EN_DIR, `${slug}.mdx`);
	const esPath = path.join(ES_DIR, `${slug}.mdx`);

	const enBody =
		frontmatter({ title, description, pubDate, tags, featured, lang: 'en' }) +
		enTemplate({ title });
	const esBody =
		frontmatter({ title, description, pubDate, tags, featured, lang: 'es' }) +
		esTemplate({ title });

	writePost(enPath, enBody, args.force);
	writePost(esPath, esBody, args.force);

	console.log('');
	console.log(`Next: write your post. Run "npm run dev" and open /blog/${slug}.`);
}

main();
