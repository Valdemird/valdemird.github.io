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
