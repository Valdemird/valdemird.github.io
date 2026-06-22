export const SITE_TITLE = 'valdemird';
export const SITE_DESCRIPTION = 'Software engineer and builder. I make developer tools and write about what I learn.';
export const SITE_DESCRIPTION_ES = 'Ingeniero de software y maker. Construyo herramientas para desarrolladores y escribo sobre lo que aprendo.';

export const SOCIAL_LINKS = {
	github: 'https://github.com/valdemird',
	twitter: '',
	linkedin: 'https://www.linkedin.com/in/sebastiancaja',
	devto: 'https://dev.to/valdemird',
} as const;

// --- Canonical author entity (Entity SEO / E-E-A-T) ---
// One stable @id reused across every page so the knowledge graph resolves a
// SINGLE person instead of a fresh anonymous node per post. Canonical name is
// the real name; "Valdemir D." is the pen name carried as alternateName, and
// both profiles live in sameAs so they collapse to one entity.
export const PERSON_ID = 'https://valdemird.com/about/#person';

export const PERSON = {
	'@type': 'Person',
	'@id': PERSON_ID,
	name: 'Sebastian Castano',
	alternateName: ['Sebastian Castano Jara', 'Valdemir D.'],
	url: 'https://valdemird.com/about/',
	jobTitle: 'Senior Software Engineer & Consultant',
	knowsAbout: ['Software Engineering', 'Developer Tools', 'AI-assisted development', 'Astro', 'React', 'Web Performance'],
	sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.devto],
	image: 'https://valdemird.com/images/about/sebastian.webp',
} as const;

// Lightweight reference: link to the canonical Person by @id without re-inlining.
export const PERSON_REF = { '@id': PERSON_ID } as const;

// --- Publisher entity ---
// Article/BlogPosting structured data expects an Organization publisher with a
// logo. For this one-person brand the Organization is the site itself; the
// Person is its founder/author. One stable @id so it resolves to a single node.
export const ORGANIZATION_ID = 'https://valdemird.com/#organization';

export const ORGANIZATION = {
	'@type': 'Organization',
	'@id': ORGANIZATION_ID,
	name: SITE_TITLE,
	url: 'https://valdemird.com',
	logo: { '@type': 'ImageObject', url: 'https://valdemird.com/favicon.svg' },
	founder: { '@id': PERSON_ID },
	sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.devto],
} as const;

export const ORGANIZATION_REF = { '@id': ORGANIZATION_ID } as const;

type Project = {
	readonly title: string;
	/** Localized description — title and tech stay shared (brand/tech names). */
	readonly description: { readonly en: string; readonly es: string };
	readonly url: string;
	readonly tech: readonly string[];
	/** Optional screenshot path (e.g. /images/projects/<slug>.webp). When omitted, the card renders a wireframe fallback. */
	readonly thumbnail?: string;
};

export const PROJECTS: readonly Project[] = [
	{
		title: 'Todo App',
		description: {
			en: 'Task manager with AI scheduling, Pomodoro timer, and drag-and-drop. Built because every other todo app annoyed me.',
			es: 'Gestor de tareas con planificación por IA, temporizador Pomodoro y drag-and-drop. Lo construí porque las demás apps de tareas me molestaban.',
		},
		url: 'https://todo.valdemird.com',
		tech: ['Next.js 15', 'React 19', 'Prisma', 'Tailwind CSS 4', 'Vercel AI SDK'],
		thumbnail: '/images/projects/todo.webp',
	},
];

// Games & interactive experiments — a playground separate from the "real" projects.
export const EXPERIMENTS: readonly Project[] = [
	{
		title: 'valdemird.games',
		description: {
			en: 'A space to explore games and interactive experiences. Real-time multiplayer rooms — drop in two players and race. First up: Caza Números.',
			es: 'Un espacio para explorar juegos y experiencias interactivas. Salas multijugador en tiempo real: entran dos jugadores y compiten. Lo primero: Caza Números.',
		},
		url: 'https://games.valdemird.com',
		tech: ['React', 'Vite', 'TypeScript', 'Socket.IO', 'Vitest'],
		thumbnail: '/images/projects/games.webp',
	},
];

// i18n UI strings
export const UI_STRINGS = {
	en: {
		nav: {
			home: 'Home',
			blog: 'Blog',
			about: 'About',
			lab: 'Lab',
			learn: 'Learn',
			switchLang: 'Switch to',
			toggleMenu: 'Toggle menu',
			skipToContent: 'Skip to content',
		},
		home: {
			greeting: "Hi, I'm",
			name: 'valdemird',
			subtitle: 'Software Engineer & Builder',
			bio: 'I ship products for companies across the Americas. After hours I build my own tools and write down what breaks. This site is me showing my work.',
			statusBadge: "Let's talk, learn, and build",
			metaDescription: 'Software engineer and builder. I make developer tools and write about what I learn.',
			projectsTitle: 'Projects',
			gamesTitle: 'Games & Experiments',
			recentPostsTitle: 'Recent Posts',
			viewAllPosts: 'View all posts',
			terminalTitle: '~/projects',
			fromLabTitle: 'From the lab',
			fromLabBlurb: 'Every diagram on this blog is a live component, not a screenshot. This one steps through the branching workflow from the worktrees post.',
			fromLabLink: 'Browse all components →',
		},
		projects: {
			previewOf: 'Preview of',
		},
		blog: {
			title: 'Blog',
			description: 'Writing about software, AI tools, and things I\'ve learned building products.',
			readMore: 'Read more',
			minRead: 'min read',
		},
		about: {
			title: 'About Me',
			description: 'Sebastian Castano, full-stack engineer in Cali, Colombia. 8+ years shipping products, a spec-driven AI workflow, and a site built from its own live components.',
		},
		footer: {
			copyright: 'All rights reserved.',
		},
	},
	es: {
		nav: {
			home: 'Inicio',
			blog: 'Blog',
			about: 'Sobre mí',
			lab: 'Lab',
			learn: 'Learn',
			switchLang: 'Cambiar a',
			toggleMenu: 'Abrir o cerrar el menú',
			skipToContent: 'Saltar al contenido',
		},
		home: {
			greeting: 'Hola, soy',
			name: 'valdemird',
			subtitle: 'Ingeniero de software y maker',
			bio: 'Lanzo productos para empresas en las Américas. Fuera del horario construyo mis propias herramientas y anoto lo que se rompe en el camino. Este sitio es mi manera de mostrar mi trabajo.',
			statusBadge: 'Hablemos, aprendamos y construyamos',
			metaDescription: 'Ingeniero de software y maker. Construyo herramientas para desarrolladores y escribo sobre lo que aprendo.',
			projectsTitle: 'Proyectos',
			gamesTitle: 'Juegos y experimentos',
			recentPostsTitle: 'Posts recientes',
			viewAllPosts: 'Ver todos los posts',
			terminalTitle: '~/proyectos',
			fromLabTitle: 'Del lab',
			fromLabBlurb: 'Cada diagrama de este blog es un componente vivo, no una captura. Este recorre el flujo de ramas del post sobre worktrees.',
			fromLabLink: 'Ver todos los componentes →',
		},
		projects: {
			previewOf: 'Vista previa de',
		},
		blog: {
			title: 'Blog',
			description: 'Sobre software, herramientas de IA y cosas que he aprendido construyendo productos.',
			readMore: 'Leer más',
			minRead: 'min de lectura',
		},
		about: {
			title: 'Sobre mí',
			description: 'Sebastian Castano, ingeniero full-stack en Cali, Colombia. Más de 8 años lanzando productos, un flujo de IA spec-driven y un sitio construido con sus propios componentes vivos.',
		},
		footer: {
			copyright: 'Todos los derechos reservados.',
		},
	},
} as const;

// --- Web properties (owned subdomains living on other servers) ---
// Models each project/experiment as a WebApplication authored by the canonical
// Person. This tells the knowledge graph "valdemird.com and these subdomains
// share one creator entity" — consolidating brand authority across the domain.
// Source of truth is PROJECTS + EXPERIMENTS, so adding a card auto-links it.
export function webPropertyNodes() {
	return [...PROJECTS, ...EXPERIMENTS].map((p) => ({
		'@type': 'WebApplication',
		'@id': `${p.url}#app`,
		name: p.title,
		url: p.url,
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web',
		description: p.description.en,
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		isPartOf: { '@id': 'https://valdemird.com/#website' },
	}));
}

// Canonical Person enriched with the properties it owns — use on identity pages
// (home, about) where the full entity graph should be declared.
export function personWithProperties() {
	return {
		...PERSON,
		owns: webPropertyNodes().map((w) => ({ '@id': w['@id'] })),
	};
}

export type Locale = keyof typeof UI_STRINGS;

export function getLocale(url: URL): Locale {
	// Check both /es/ prefix (regular pages) and /blog/es/ (blog posts with es/ in content id)
	return url.pathname.startsWith('/es') || /^\/blog\/es\//.test(url.pathname) ? 'es' : 'en';
}

export function t(url: URL) {
	return UI_STRINGS[getLocale(url)];
}
