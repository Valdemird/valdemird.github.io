import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const GET: APIRoute = async () => {
	const posts = (await getCollection('blog'))
		.filter((p) => p.data.lang === 'en')
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const lines = [
		`# ${SITE_TITLE}`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		'## About',
		'',
		'Personal website and blog by Valdemir D., a senior software engineer focused on',
		'developer tools, AI-assisted workflows, and building products. Based in Colombia.',
		'',
		'- Site: https://valdemird.com',
		'- GitHub: https://github.com/valdemird',
		'- LinkedIn: https://www.linkedin.com/in/sebastiancaja',
		'- Languages: English, Spanish (all content is bilingual)',
		'',
		'## Blog Posts',
		'',
		...posts.map((post) => {
			const date = post.data.pubDate.toISOString().split('T')[0];
			const tags = post.data.tags?.join(', ') || '';
			return [
				`### ${post.data.title}`,
				`- URL: https://valdemird.com/blog/${post.id}/`,
				`- Date: ${date}`,
				`- Description: ${post.data.description}`,
				...(tags ? [`- Tags: ${tags}`] : []),
				'',
			].join('\n');
		}),
		'## Optional',
		'',
		'- Full content: https://valdemird.com/llms-full.txt',
		'- RSS feed: https://valdemird.com/rss.xml',
		'- Sitemap: https://valdemird.com/sitemap-index.xml',
	];

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
