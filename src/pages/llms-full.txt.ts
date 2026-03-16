import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

function cleanMdxBody(raw: string): string {
	return raw
		// Remove MDX import statements
		.replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, '')
		// Remove JSX-style component tags (self-closing and opening/closing)
		.replace(/<\w+[\s\S]*?\/>/g, '')
		.replace(/<\/?\w+[^>]*>/g, '')
		// Clean HTML entities
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		// Collapse excessive blank lines
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

export const GET: APIRoute = async () => {
	const posts = (await getCollection('blog'))
		.filter((p) => p.data.lang === 'en')
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const lines = [
		`# ${SITE_TITLE} — Full Content`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		'This file contains the full text of all blog posts for LLM consumption.',
		'For a summary with links, see: https://valdemird.com/llms.txt',
		'',
		'---',
		'',
	];

	for (const post of posts) {
		const date = post.data.pubDate.toISOString().split('T')[0];
		const tags = post.data.tags?.join(', ') || '';

		const plainText = post.body ? cleanMdxBody(post.body) : '(Content not available in plain text)';

		lines.push(
			`## ${post.data.title}`,
			'',
			`- URL: https://valdemird.com/blog/${post.id}/`,
			`- Date: ${date}`,
			`- Description: ${post.data.description}`,
			...(tags ? [`- Tags: ${tags}`] : []),
			'',
			plainText,
			'',
			'---',
			'',
		);
	}

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
