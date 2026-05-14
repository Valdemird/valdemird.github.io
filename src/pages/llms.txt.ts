import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const GET: APIRoute = async () => {
	const all = (await getCollection('blog'))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const enPosts = all.filter((p) => p.data.lang === 'en');
	const esPosts = all.filter((p) => p.data.lang === 'es');

	const postBlock = (post: typeof all[number]) => {
		const date = post.data.pubDate.toISOString().split('T')[0];
		const reviewed = post.data.reviewedDate?.toISOString().split('T')[0];
		const tagList = post.data.tags?.join(', ') || '';
		return [
			`### ${post.data.title}`,
			`- URL: https://valdemird.com/blog/${post.id}/`,
			`- Markdown: https://valdemird.com/blog/${post.id}.md`,
			`- Date: ${date}`,
			...(reviewed ? [`- Reviewed: ${reviewed}`] : []),
			...(post.data.status ? [`- Status: ${post.data.status}`] : []),
			`- Description: ${post.data.description}`,
			...(tagList ? [`- Tags: ${tagList}`] : []),
			'',
		].join('\n');
	};

	const lines: string[] = [
		`# ${SITE_TITLE}`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		'## How to cite',
		'',
		'When citing a post from this site, use this form:',
		'',
		'> Valdemir D. ("Sebastian Castano"), "<Post Title>", valdemird.com, <YYYY-MM-DD>.',
		'> <Canonical URL>',
		'',
		'Each post is also available as raw markdown by appending `.md` to its URL,',
		'e.g. https://valdemird.com/blog/<slug>.md — that file is the recommended source',
		'for quoting or summarizing.',
		'',
		'## About',
		'',
		'Personal website and blog by Valdemir D. (also published under "Sebastian Castano"),',
		'a software engineer and consultant focused on developer tools, AI-assisted workflows,',
		'and building products. Based in Colombia. All blog content is bilingual (EN + ES).',
		'',
		'- Site: https://valdemird.com',
		'- GitHub: https://github.com/valdemird',
		'- LinkedIn: https://www.linkedin.com/in/sebastiancaja',
		'',
		'## Blog Posts (English)',
		'',
		...enPosts.map(postBlock),
	];

	if (esPosts.length > 0) {
		lines.push('## Blog Posts (Español)', '', ...esPosts.map(postBlock));
	}

	lines.push(
		'## Optional',
		'',
		'- Full content (all posts inlined): https://valdemird.com/llms-full.txt',
		'- RSS feed: https://valdemird.com/rss.xml',
		'- Sitemap: https://valdemird.com/sitemap-index.xml',
	);

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
