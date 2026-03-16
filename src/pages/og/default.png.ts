import type { APIRoute } from 'astro';
import satori from 'satori';
import sharp from 'sharp';
import { getOgSatoriFonts } from '../../lib/og-fonts';

export const GET: APIRoute = async () => {
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
				// Background decoration
				{
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							bottom: -120,
							left: -120,
							width: 500,
							height: 500,
							borderRadius: 250,
							background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
						},
						children: '',
					},
				},
				{
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							top: -80,
							right: -80,
							width: 350,
							height: 350,
							borderRadius: 175,
							background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
						},
						children: '',
					},
				},
				// Main content
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							flex: 1,
							padding: '64px',
							textAlign: 'center' as const,
						},
						children: [
							// Name
							{
								type: 'div',
								props: {
									style: {
										fontSize: 64,
										color: '#ffffff',
										fontWeight: 700,
										letterSpacing: -2,
										marginBottom: 16,
									},
									children: 'valdemird',
								},
							},
							// Accent line
							{
								type: 'div',
								props: {
									style: {
										width: 80,
										height: 4,
										background: 'linear-gradient(90deg, #6366f1, #818cf8)',
										borderRadius: 2,
										marginBottom: 28,
									},
									children: '',
								},
							},
							// Subtitle
							{
								type: 'div',
								props: {
									style: {
										fontFamily: 'Sans',
										fontSize: 26,
										color: '#94a3b8',
										lineHeight: 1.5,
										maxWidth: 600,
									},
									children: 'Software engineer, builder, and writer.',
								},
							},
						],
					},
				},
				// Bottom watermark
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							justifyContent: 'center',
							paddingBottom: 40,
						},
						children: 'valdemird.com',
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
