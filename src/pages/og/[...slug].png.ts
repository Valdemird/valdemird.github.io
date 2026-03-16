import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import { getOgSatoriFonts } from '../../lib/og-fonts';

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: {
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			tags: post.data.tags || [],
		},
	}));
};

function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export const GET: APIRoute = async ({ props }) => {
	const { title, description, pubDate, tags } = props;

	const tagElements = (tags as string[]).slice(0, 4).map((tag: string) => ({
		type: 'div',
		props: {
			style: {
				fontFamily: 'Sans',
				fontSize: 14,
				color: '#a5b4fc',
				background: 'rgba(99, 102, 241, 0.15)',
				borderRadius: 6,
				padding: '4px 12px',
				border: '1px solid rgba(99, 102, 241, 0.3)',
			},
			children: tag,
		},
	}));

	const markup = {
		type: 'div',
		props: {
			style: {
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: '#1a1a2e',
				fontFamily: 'Serif',
				position: 'relative',
				overflow: 'hidden',
			},
			children: [
				// Top accent gradient line
				{
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							height: 6,
							background: 'linear-gradient(90deg, #6366f1, #818cf8, #6366f1)',
						},
						children: '',
					},
				},
				// Subtle background decoration
				{
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							top: -100,
							right: -100,
							width: 400,
							height: 400,
							borderRadius: 200,
							background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
						},
						children: '',
					},
				},
				// Main content container
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
							padding: '56px 64px 48px',
							flex: 1,
						},
						children: [
							// Top section with date
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										flexDirection: 'column',
									},
									children: [
										{
											type: 'div',
											props: {
												style: {
													fontFamily: 'Sans',
													fontSize: 16,
													color: '#818cf8',
													letterSpacing: 2,
													textTransform: 'uppercase' as const,
													marginBottom: 24,
												},
												children: formatDate(pubDate as Date),
											},
										},
										// Title
										{
											type: 'div',
											props: {
												style: {
													fontSize: title.length > 60 ? 36 : title.length > 40 ? 42 : 48,
													color: '#ffffff',
													lineHeight: 1.2,
													fontWeight: 700,
													letterSpacing: -1,
													maxWidth: '90%',
												},
												children: title as string,
											},
										},
										// Description
										{
											type: 'div',
											props: {
												style: {
													fontFamily: 'Sans',
													fontSize: 20,
													color: '#94a3b8',
													lineHeight: 1.5,
													marginTop: 20,
													maxWidth: '85%',
												},
												children: (description as string).length > 140
													? (description as string).slice(0, 140) + '...'
													: (description as string),
											},
										},
									],
								},
							},
							// Bottom section: tags + watermark
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-end',
									},
									children: [
										// Tags
										{
											type: 'div',
											props: {
												style: {
													display: 'flex',
													gap: 8,
													flexWrap: 'wrap' as const,
												},
												children: tagElements.length > 0 ? tagElements : '',
											},
										},
										// Watermark
										{
											type: 'div',
											props: {
												style: {
													fontFamily: 'Sans',
													fontSize: 18,
													color: '#475569',
													letterSpacing: 1,
												},
												children: 'valdemird.com',
											},
										},
									],
								},
							},
						],
					},
				},
			],
		},
	};

	const svg = await satori(markup as any, {
		width: 1200,
		height: 630,
		fonts: getOgSatoriFonts(),
	});

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
