import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { cleanMdxBody } from '../lib/mdx-plaintext';

export const GET: APIRoute = async () => {
	const all = (await getCollection('blog'))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const enPosts = all.filter((p) => p.data.lang === 'en');
	const esPosts = all.filter((p) => p.data.lang === 'es');

	const lines: string[] = [
		`# ${SITE_TITLE} — Full Content`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		'This file contains the full text of all blog posts for LLM consumption.',
		'For a summary with links, see: https://valdemird.com/llms.txt',
		'For a single post in markdown: append `.md` to any /blog/<slug>/ URL.',
		'',
		'---',
		'',
	];

	const renderSection = (label: string, posts: typeof enPosts) => {
		if (!posts.length) return;
		lines.push(`# ${label}`, '');
		for (const post of posts) {
			const date = post.data.pubDate.toISOString().split('T')[0];
			const tagList = post.data.tags?.join(', ') || '';
			const plainText = post.body ? cleanMdxBody(post.body) : '(Content not available in plain text)';

			lines.push(
				`## ${post.data.title}`,
				'',
				`- URL: https://valdemird.com/blog/${post.id}/`,
				`- Markdown: https://valdemird.com/blog/${post.id}.md`,
				`- Date: ${date}`,
				`- Description: ${post.data.description}`,
				...(tagList ? [`- Tags: ${tagList}`] : []),
				'',
				plainText,
				'',
				'---',
				'',
			);
		}
	};

	renderSection('English posts', enPosts);
	renderSection('Spanish posts (en español)', esPosts);

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
