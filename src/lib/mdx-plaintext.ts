/**
 * Shared plaintext utilities for MDX blog bodies.
 *
 * Strips JSX/imports/HTML entities so the result can be served as raw
 * markdown (per-post `.md`, `llms.txt`, `llms-full.txt`) or counted as
 * prose words for SEO/JSON-LD.
 */

export function cleanMdxBody(raw: string): string {
	return raw
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
		const bullets: string[] = [];
		const literal = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
		let m: RegExpExecArray | null;
		while ((m = literal.exec(block[1])) !== null) {
			bullets.push(m[2].replace(/\\(.)/g, '$1'));
		}
		return bullets.length > 0 ? bullets : null;
	} catch {
		return null;
	}
}
