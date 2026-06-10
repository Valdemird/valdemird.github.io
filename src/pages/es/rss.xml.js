import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION_ES } from '../../consts';

export async function GET(context) {
	const posts = (await getCollection('blog'))
		.filter((post) => post.data.lang === 'es')
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
	return rss({
		title: `${SITE_TITLE} — en español`,
		description: SITE_DESCRIPTION_ES,
		site: context.site,
		customData: '<language>es</language>',
		// ES post ids carry the `es/` prefix, so this resolves to /blog/es/<slug>/.
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.id}/`,
		})),
	});
}
