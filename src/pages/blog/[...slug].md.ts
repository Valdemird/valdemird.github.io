import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: { post },
	}));
}

function cleanMdxBody(raw: string): string {
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

export const GET: APIRoute = ({ props }) => {
	const { post } = props as { post: Awaited<ReturnType<typeof getCollection<'blog'>>>[number] };
	const { title, description, pubDate, updatedDate, tags, lang } = post.data;

	const date = pubDate.toISOString().split('T')[0];
	const updated = updatedDate?.toISOString().split('T')[0];
	const canonical = `https://valdemird.com/blog/${post.id}/`;
	const body = post.body ? cleanMdxBody(post.body) : '';

	const frontmatter = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`description: ${JSON.stringify(description)}`,
		`date: ${date}`,
		...(updated ? [`updated: ${updated}`] : []),
		`url: ${canonical}`,
		`lang: ${lang ?? 'en'}`,
		...(tags && tags.length ? [`tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`] : []),
		'---',
	].join('\n');

	const md = `${frontmatter}\n\n# ${title}\n\n> ${description}\n\n${body}\n`;

	return new Response(md, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
