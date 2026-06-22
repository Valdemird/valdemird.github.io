import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		reviewedDate: z.coerce.date().optional(),
		status: z.string().optional(),
		heroImage: z.string().optional(),
		heroImageAlt: z.string().optional(),
		tags: z.array(z.string()).optional(),
		/** Skimmer bullets — also surfaced as the JSON-LD `abstract`. */
		tldr: z.array(z.string()).optional(),
		featured: z.boolean().optional(),
		/** Work-in-progress: excluded from routes, listings, RSS and the .md feed. */
		draft: z.boolean().default(false),
		lang: z.enum(['en', 'es']).default('en'),
	}),
});

// Learning wiki: bilingual reference on building agentic systems.
// EN modules live in ./src/content/learn/*.mdx, ES in ./src/content/learn/es/*.mdx.
// Slugs are shared across languages so EN/ES pair for hreflang (like blog).
const learn = defineCollection({
	loader: glob({ base: './src/content/learn', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		/** Phase 1–8 of the learning path; drives sidebar grouping. */
		phase: z.number().int().min(1).max(8),
		/** Global reading order 1–16; drives prev/next and sidebar order. */
		order: z.number().int(),
		/** Knowledge tier: fundamento | core | fiabilidad | produccion | frontera. */
		tier: z.enum(['fundamento', 'core', 'fiabilidad', 'produccion', 'frontera']),
		/** How long the idea stays true. */
		durability: z.enum(['atemporal', 'duradero', 'efimero']).optional(),
		updatedDate: z.coerce.date().optional(),
		tldr: z.array(z.string()).optional(),
		/** Attributed sources with a credibility grade A/B/C/D. */
		sources: z
			.array(
				z.object({
					grade: z.enum(['A', 'B', 'C', 'D']),
					title: z.string(),
					author: z.string().optional(),
					year: z.union([z.string(), z.number()]).optional(),
					url: z.string().optional(),
				}),
			)
			.optional(),
		lang: z.enum(['en', 'es']).default('en'),
	}),
});

export const collections = { blog, learn };
