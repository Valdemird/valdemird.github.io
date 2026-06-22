import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { cleanMdxBody } from '../../lib/mdx-plaintext';

export async function getStaticPaths() {
	const posts = (await getCollection('blog')).filter((post) => !post.data.draft);
	return posts.map((post) => ({
		params: { slug: post.id },
		props: { post },
	}));
}

export const GET: APIRoute = ({ props }) => {
	const { post } = props as { post: Awaited<ReturnType<typeof getCollection<'blog'>>>[number] };
	const { title, description, pubDate, updatedDate, reviewedDate, status, tags, lang } = post.data;

	const date = pubDate.toISOString().split('T')[0];
	const updated = updatedDate?.toISOString().split('T')[0];
	const reviewed = reviewedDate?.toISOString().split('T')[0];
	const canonical = `https://valdemird.com/blog/${post.id}/`;
	const body = post.body ? cleanMdxBody(post.body) : '';

	const frontmatter = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`description: ${JSON.stringify(description)}`,
		`date: ${date}`,
		...(updated ? [`updated: ${updated}`] : []),
		...(reviewed ? [`reviewed: ${reviewed}`] : []),
		...(status ? [`status: ${JSON.stringify(status)}`] : []),
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
